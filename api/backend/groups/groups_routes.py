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
groups = Blueprint('groups', __name__)

#------------------------------------------------------------
# Get groups
@groups.route('/', methods=['GET'])
def get_groups():
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM `groups`
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

# Create a new group
@groups.route('/', methods=['POST'])
def create_group():
    group_data = request.json
    name = group_data.get('name')
    description = group_data.get('description')

    if not name:
        return make_response(jsonify({'message': 'Group name is required'}), 400)

    cursor = db.get_db().cursor()
    try:
        cursor.execute('''INSERT INTO `groups` (name, description)
                       VALUES (%s, %s)
                       ''', (name, description))
        
        new_group_id = cursor.lastrowid # Get the ID of the inserted row
        db.get_db().commit()
        
        response_data = {
            'message': 'Group created successfully',
            'new_group_id': new_group_id # Include the new ID in the response
        }
        response = make_response(jsonify(response_data))
        response.status_code = 201
        return response
    except Exception as e:
        db.get_db().rollback() # Rollback in case of error
        # Check for duplicate entry error (adjust error code/message as needed for your DB)
        if 'Duplicate entry' in str(e):
             return make_response(jsonify({'message': f'Group name "{name}" already exists.'}), 409) # Conflict
        current_app.logger.error(f"Error creating group: {e}")
        return make_response(jsonify({'message': 'Error creating group'}), 500)

# Get group by group_id
@groups.route('/<int:group_id>', methods=['GET'])
def get_group_by_id(group_id):
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM `groups` WHERE id = %s
                   ''', (group_id))

    # Python Dictionary
    theData = cursor.fetchall()

    # Create a HTTP Response object and add results of the query to it
    # after "jasonify"-ing it.
    response = make_response(jsonify(theData))
    # set the proper HTTP Status code of 200 (meaning all good)
    response.status_code = 200
    # send the response back to the client
    return response

# Get members for group_id
@groups.route('/<int:group_id>/members', methods=['GET'])
def get_group_members(group_id):
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT DISTINCT user_id FROM group_membership WHERE group_id = %s
                   ''', (group_id))

    # Python Dictionary
    theData = cursor.fetchall()

    response = make_response(jsonify(theData))
    # set the proper HTTP Status code of 200 (meaning all good)
    response.status_code = 200
    # send the response back to the client
    return response


# User joins a group
@groups.route('/<int:group_id>/members', methods=['POST'])
def join_group(group_id):
    user_data = request.json
    cursor = db.get_db().cursor()
    cursor.execute('''INSERT INTO group_membership (group_id, user_id)
                   VALUES (%s, %s)
                   ''', (group_id, user_data['user_id']))
    
    db.get_db().commit()
    response = make_response(jsonify({'message': 'User joined a group successfully'}))
    response.status_code = 201
    return response

# User leaves a group
@groups.route('/<int:group_id>/members/<int:user_id>', methods=['DELETE'])
def leave_group(group_id, user_id):
    cursor = db.get_db().cursor()
    cursor.execute('''DELETE FROM group_membership WHERE group_id = %s AND user_id = %s
                   ''', (group_id, user_id))
    
    db.get_db().commit()
    response = make_response(jsonify({'message': 'User\'s group membership deleted successfully'}))
    response.status_code = 200
    return response
