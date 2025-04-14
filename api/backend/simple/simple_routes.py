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
def welcome():
    current_app.logger.info('GET / handler')
    welcome_message = '<h1>Welcome to the CS 3200 Project Template REST API'
    response = make_response(welcome_message)
    response.status_code = 200
    return response

@simple_routes.route('/strava')
def get_strava_data():
    #html info about strava
    current_app.logger.info('GET /strava route')
    strava_info = '<h1>Strava API</h1>'
    strava_info += '<p>Strava API is a third-party API that provides access to fitness data.</p>'
    response = make_response(strava_info)
    response.status_code = 200
    return response


@simple_routes.route('/strava/users')
def get_strava_users():
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM users
    ''')
    
    theData = cursor.fetchall()
    
    the_response = make_response(jsonify(theData))
    the_response.status_code = 200
    return the_response

