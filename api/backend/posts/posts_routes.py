########################################################
# Sample customers blueprint of endpoints
# Remove this file if you are not using it in your project
########################################################

from flask import Blueprint
from flask import request
from flask import jsonify
from flask import make_response
from flask import current_app
from backend.db_connection import db
from datetime import datetime # Import datetime

#------------------------------------------------------------
# Create a new Blueprint object, which is a collection of 
# routes.
posts = Blueprint('posts', __name__)

# Helper function to format datetime objects in fetched data
def format_datetime_in_data(data):
    if not data:
        return data
    
    formatted_data = []
    for row in data:
        formatted_row = dict(row) # Convert Row object to dictionary
        if 'created_at' in formatted_row and isinstance(formatted_row['created_at'], datetime):
            formatted_row['created_at'] = formatted_row['created_at'].isoformat()
        # Add formatting for other datetime fields if necessary
        formatted_data.append(formatted_row)
    return formatted_data

#------------------------------------------------------------
# Get posts:
# - If 'author_id' is provided, get all posts by that user.
# - If 'user_id' is provided, get posts for that user's feed (from groups, excluding own).
# - Otherwise, return error.
@posts.route('/', methods=['GET'])
def get_posts():
    author_id_str = request.args.get('author_id')
    user_id_str = request.args.get('user_id') # For feed filtering

    cursor = db.get_db().cursor()
    theData = []

    if author_id_str:
        # Fetch posts by a specific author
        try:
            author_id = int(author_id_str)
            cursor.execute('''
                SELECT * 
                FROM posts 
                WHERE user_id = %s
                ORDER BY created_at DESC
            ''', (author_id,))
            theData = cursor.fetchall()
        except ValueError:
            return make_response(jsonify({'message': 'Invalid author_id format'}), 400)
        except Exception as e:
            current_app.logger.error(f"Error fetching posts by author: {e}")
            return make_response(jsonify({'message': 'Error fetching posts'}), 500)

    elif user_id_str:
        # Fetch posts for a user's feed (current logic)
        try:
            user_id = int(user_id_str)
            # Select distinct posts where the post is in a group the user is a member of,
            # AND the post was not created by the user.
            cursor.execute('''
                SELECT DISTINCT p.* 
                FROM posts p
                JOIN group_posts gp ON p.id = gp.post_id
                JOIN group_membership gm ON gp.group_id = gm.group_id
                WHERE gm.user_id = %s AND p.user_id != %s
                ORDER BY p.created_at DESC
            ''', (user_id, user_id))
            theData = cursor.fetchall()
        except ValueError:
            return make_response(jsonify({'message': 'Invalid user_id format'}), 400)
        except Exception as e:
            current_app.logger.error(f"Error fetching user feed posts: {e}")
            return make_response(jsonify({'message': 'Error fetching posts'}), 500)
            
    else:
        # Neither author_id nor user_id provided
        return make_response(jsonify({'message': 'Either author_id or user_id query parameter is required'}), 400)

    # Format datetime fields for the fetched data
    formatted_data = format_datetime_in_data(theData)

    # Create a HTTP Response object
    response = make_response(jsonify(formatted_data))
    response.status_code = 200
    return response

# Get posts by post_id
@posts.route('/<int:post_id>', methods=['GET'])
def get_post_by_id(post_id):
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM posts WHERE id = %s
                   ''', (post_id,))

    # Python Dictionary
    theData = cursor.fetchall()
    
    # Format datetime fields
    formatted_data = format_datetime_in_data(theData)

    # Create a HTTP Response object and add results of the query to it
    # after "jasonify"-ing it.
    response = make_response(jsonify(formatted_data)) # Use formatted data
    # set the proper HTTP Status code of 200 (meaning all good)
    response.status_code = 200
    # send the response back to the client
    return response

# Get comments on post
@posts.route('/<int:post_id>/comments', methods=['GET'])
def get_comments_on_post(post_id):
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM comments WHERE post_id = %s
                      ORDER BY created_at ASC -- Optional: Order comments chronologically
                   ''', (post_id,))

    # Python Dictionary
    theData = cursor.fetchall()
    
    # Format datetime fields
    formatted_data = format_datetime_in_data(theData)

    # Create a HTTP Response object and add results of the query to it
    # after "jasonify"-ing it.
    response = make_response(jsonify(formatted_data)) # Use formatted data
    # set the proper HTTP Status code of 200 (meaning all good)
    response.status_code = 200
    # send the response back to the client
    return response

# Get single comment on post
@posts.route('/<int:post_id>/comments/<int:comment_id>', methods=['GET'])
def get_single_comment(post_id, comment_id):
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM comments WHERE post_id = %s AND id = %s
                   ''', (post_id, comment_id))

    # Python Dictionary
    theData = cursor.fetchall()
    
    # Format datetime fields
    formatted_data = format_datetime_in_data(theData)

    # Create a HTTP Response object and add results of the query to it
    # after "jasonify"-ing it.
    response = make_response(jsonify(formatted_data)) # Use formatted data
    # set the proper HTTP Status code of 200 (meaning all good)
    response.status_code = 200
    # send the response back to the client
    return response

@posts.route('/', methods=['POST'])
def create_post():
    post_data = request.json
    cursor = db.get_db().cursor()
    try:
        # Insert into posts table
        cursor.execute('''
            INSERT INTO posts (user_id, title, content, post_flair)
            VALUES (%s, %s, %s, %s)
        ''', (
            post_data['user_id'],
            post_data['title'],
            post_data['content'],
            post_data['post_flair']
        ))
        
        # Get the ID of the newly created post
        new_post_id = cursor.lastrowid
        
        # Check if group_ids is provided and is a list, then insert into group_posts for each id
        group_ids = post_data.get('group_ids', []) # Default to empty list if not provided
        if isinstance(group_ids, list):
            for group_id in group_ids:
                # Ensure group_id is an integer before inserting
                try:
                    gid = int(group_id)
                    cursor.execute('''
                        INSERT INTO group_posts (post_id, group_id)
                        VALUES (%s, %s)
                    ''', (new_post_id, gid))
                except (ValueError, TypeError):
                    # Log or handle cases where group_id is not a valid integer
                    current_app.logger.warning(f"Skipping invalid group_id: {group_id} for post_id: {new_post_id}")
                    continue # Skip to the next group_id

        db.get_db().commit()
        response = make_response(jsonify({'message': 'Post created successfully', 'post_id': new_post_id}))
        response.status_code = 201
        return response
    except Exception as e:
        db.get_db().rollback()
        current_app.logger.error(f"Error creating post: {e}")
        return make_response(jsonify({'message': 'Error creating post'}), 500)

@posts.route('/<int:post_id>/comments', methods=['POST'])
def create_comment(post_id):
    comment_data = request.json
    cursor = db.get_db().cursor()
    cursor.execute('''
        INSERT INTO comments (post_id, user_id, content)
        VALUES (%s, %s, %s)
    ''', (post_id, comment_data['user_id'], comment_data['content']))
    db.get_db().commit()
    response = make_response(jsonify({'message': 'Comment created successfully'}))
    response.status_code = 201
    return response

@posts.route('/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    post_data = request.json
    cursor = db.get_db().cursor()
    cursor.execute('''
        UPDATE posts 
        SET title = %s,
            content = %s,
            post_flair = %s
        WHERE id = %s
    ''', (
        post_data['title'],
        post_data['content'],
        post_data['post_flair'],
        post_id
    ))
    db.get_db().commit()
    response = make_response(jsonify({'message': 'Post updated successfully'}))
    response.status_code = 200
    return response

@posts.route('/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    cursor = db.get_db().cursor()
    cursor.execute('DELETE FROM posts WHERE id = %s', (post_id,))
    db.get_db().commit()
    response = make_response(jsonify({'message': 'Post deleted successfully'}))
    response.status_code = 200
    return response

@posts.route('/<int:post_id>/comments/<int:comment_id>', methods=['PUT'])
def update_comment(post_id, comment_id):
    comment_data = request.json
    cursor = db.get_db().cursor()
    cursor.execute('''
        UPDATE comments 
        SET content = %s
        WHERE id = %s AND post_id = %s
    ''', (
        comment_data['content'],
        comment_id,
        post_id
    ))
    db.get_db().commit()
    response = make_response(jsonify({'message': 'Comment updated successfully'}))
    response.status_code = 200
    return response

@posts.route('/<int:post_id>/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(post_id, comment_id):
    cursor = db.get_db().cursor()
    cursor.execute('DELETE FROM comments WHERE id = %s AND post_id = %s', (comment_id, post_id))
    db.get_db().commit()
    response = make_response(jsonify({'message': 'Comment deleted successfully'}))
    response.status_code = 200
    return response