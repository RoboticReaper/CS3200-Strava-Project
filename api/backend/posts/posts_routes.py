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