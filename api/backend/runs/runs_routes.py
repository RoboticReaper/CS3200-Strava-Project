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
runs = Blueprint('runs', __name__)

#------------------------------------------------------------
# Get runs by user_id
@runs.route('/<int:user_id>', methods=['GET'])
def get_runs(user_id):
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM run WHERE user_id = %s''', (user_id,)
                   )

    # Python Dictionary
    theData = cursor.fetchall()

    # Create a HTTP Response object and add results of the query to it
    # after "jasonify"-ing it.
    response = make_response(jsonify(theData))
    # set the proper HTTP Status code of 200 (meaning all good)
    response.status_code = 200
    # send the response back to the client
    return response


# Get runs by user_id and run_id
@runs.route('/<int:user_id>/<int:run_id>', methods=['GET'])
def get_run(user_id, run_id):
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM run WHERE user_id = %s AND id = %s''', (user_id, run_id)
                   )

    # Python Dictionary
    theData = cursor.fetchall()

    # Create a HTTP Response object and add results of the query to it
    # after "jasonify"-ing it.
    response = make_response(jsonify(theData))
    # set the proper HTTP Status code of 200 (meaning all good)
    response.status_code = 200
    # send the response back to the client
    return response

@runs.route('/', methods=['POST'])
def create_run():
    run_data = request.json
    cursor = db.get_db().cursor()
    cursor.execute('''
        INSERT INTO run (user_id, distance, duration, time, calories, avg_pace)
        VALUES (%s, %s, %s, %s, %s, %s)
    ''', (
        run_data['user_id'],
        run_data['distance'],
        run_data['duration'],
        run_data['time'],
        run_data['calories'],
        run_data['avg_pace']
    ))
    db.get_db().commit()
    response = make_response(jsonify({'message': 'Run created successfully'}))
    response.status_code = 201
    return response

@runs.route('/<int:user_id>/<int:run_id>', methods=['PUT'])
def update_run(user_id, run_id):
    run_data = request.json
    cursor = db.get_db().cursor()
    cursor.execute('''
        UPDATE run 
        SET distance = %s,
            duration = %s,
            time = %s,
            calories = %s,
            avg_pace = %s
        WHERE id = %s AND user_id = %s
    ''', (
        run_data['distance'],
        run_data['duration'],
        run_data['time'],
        run_data['calories'],
        run_data['avg_pace'],
        run_id,
        user_id
    ))
    db.get_db().commit()
    response = make_response(jsonify({'message': 'Run updated successfully'}))
    response.status_code = 200
    return response

@runs.route('/<int:user_id>/<int:run_id>', methods=['DELETE'])
def delete_run(user_id, run_id):
    cursor = db.get_db().cursor()
    cursor.execute('DELETE FROM run WHERE id = %s AND user_id = %s', (run_id, user_id))
    db.get_db().commit()
    response = make_response(jsonify({'message': 'Run deleted successfully'}))
    response.status_code = 200
    return response
