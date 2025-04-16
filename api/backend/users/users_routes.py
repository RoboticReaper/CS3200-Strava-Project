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
users = Blueprint('users', __name__)

#------------------------------------------------------------
# Get users
@users.route('/', methods=['GET'])
def get_users():
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM users
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


# Create users
@users.route('/', methods=['POST'])
def create_users():
    user_data = request.json
    cursor = db.get_db().cursor()
    cursor.execute('''INSERT INTO users (first_name, last_name, email)
                   VALUES (%s, %s, %s)
    ''', (
        user_data['first_name'],
        user_data['last_name'],
        user_data['email'],
    ))

    db.get_db().commit()

    response = make_response(jsonify({'message': 'User created successfully'}))
    response.status_code = 201
    return response


# Get users by id
@users.route('/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM users WHERE id = %s
    ''', (user_id,))
    # Python Dictionary
    theData = cursor.fetchall()

    # Create a HTTP Response object and add results of the query to it
    # after "jasonify"-ing it.
    response = make_response(jsonify(theData))
    # set the proper HTTP Status code of 200 (meaning all good)
    response.status_code = 200
    # send the response back to the client
    return response


# Update user details by id
@users.route('/<int:user_id>', methods=['PUT'])
def update_user_by_id(user_id):
    user_data = request.json
    cursor = db.get_db().cursor()
    cursor.execute('''UPDATE users
                   SET first_name = %s, last_name = %s, email = %s, profile_hidden = %s, is_flagged = %s
                   WHERE id = %s
    ''', (
        user_data['first_name'],
        user_data['last_name'],
        user_data['email'],
        user_data['profile_hidden'],
        user_data['is_flagged'],
        user_id
    ))
    db.get_db().commit()

    response = make_response(jsonify({'message': 'User updated successfully'}))
    response.status_code = 200
    return response