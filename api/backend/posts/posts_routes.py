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

#------------------------------------------------------------
# Create a new Blueprint object, which is a collection of 
# routes.
posts = Blueprint('posts', __name__)

#------------------------------------------------------------
# Get posts 
@posts.route('/', methods=['GET'])
def get_runs():
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM posts
                   ''')

    # Python Dictionary
    theData = cursor.fetchall()

    # Create a HTTP Response object and add results of the query to it
    # after "jasonify"-ing it.
    response = make_response(jsonify(theData))
    # set the proper HTTP Status code of 200 (meaning all good)
    response.status_code = 200
    # send the response back to the client
    return response

# Get posts by post_id
@posts.route('/<int:post_id>', methods=['GET'])
def get_post_by_id(post_id):
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM posts WHERE id = %s
                   ''', (post_id,))

    # Python Dictionary
    theData = cursor.fetchall()

    # Create a HTTP Response object and add results of the query to it
    # after "jasonify"-ing it.
    response = make_response(jsonify(theData))
    # set the proper HTTP Status code of 200 (meaning all good)
    response.status_code = 200
    # send the response back to the client
    return response

# Get comments on post
@posts.route('/<int:post_id>/comments', methods=['GET'])
def get_comments_on_post(post_id):
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM comments WHERE post_id = %s
                   ''', (post_id,))

    # Python Dictionary
    theData = cursor.fetchall()

    # Create a HTTP Response object and add results of the query to it
    # after "jasonify"-ing it.
    response = make_response(jsonify(theData))
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

    # Create a HTTP Response object and add results of the query to it
    # after "jasonify"-ing it.
    response = make_response(jsonify(theData))
    # set the proper HTTP Status code of 200 (meaning all good)
    response.status_code = 200
    # send the response back to the client
    return response

@posts.route('/', methods=['POST'])
def create_post():
    post_data = request.json
    cursor = db.get_db().cursor()
    cursor.execute('''
        INSERT INTO posts (user_id, title, content, post_flair)
        VALUES (%s, %s, %s, %s)
    ''', (
        post_data['user_id'],
        post_data['title'],
        post_data['content'],
        post_data['post_flair']
    ))
    db.get_db().commit()
    response = make_response(jsonify({'message': 'Post created successfully'}))
    response.status_code = 201
    return response

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