from flask import Blueprint, request, jsonify, make_response, current_app, redirect, url_for
import json
from backend.db_connection import db
from backend.simple.playlist import sample_playlist_data

# This blueprint handles some basic routes that you can use for testing
simple_routes = Blueprint('simple_routes', __name__)


# ------------------------------------------------------------
# / is the most basic route
# Once the api container is started, in a browser, go to 
# localhost:4000/playlist


@simple_routes.route('/')
def get_strava_data():
    #html info about strava
    current_app.logger.info('GET /strava route')
    strava_info = '<h1>Strava API</h1>'
    strava_info += '<p>Strava API is a third-party API that provides access to fitness data.</p>'
    response = make_response(strava_info)
    response.status_code = 200
    return response


@simple_routes.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM leaderboard ORDER BY total_distance DESC
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

@simple_routes.route('/leaderboard', methods=['PUT'])
def update_leaderboard():
    current_app.logger.info('PUT /leaderboard route')
    
    # Get data from request JSON
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    user_id = data.get('user_id')
    total_distance = data.get('total_distance')
    total_time = data.get('total_time')

    if user_id is None or total_distance is None or total_time is None:
        return jsonify({"error": "Missing required fields: user_id, total_distance, total_time"}), 400

    try:
        cursor = db.get_db().cursor()
        
        # Update existing record - assumes user_id exists
        cursor.execute('''
            UPDATE leaderboard 
            SET total_distance = %s, total_time = %s 
            WHERE user_id = %s
        ''', (total_distance, total_time, user_id))

        db.get_db().commit()
        
        response = make_response(jsonify({"message": "Leaderboard updated successfully"}))
        response.status_code = 200
        return response

    except Exception as e:
        db.get_db().rollback()
        current_app.logger.error(f"Error updating leaderboard: {e}")
        return jsonify({"error": "Failed to update leaderboard"}), 500