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
alerts = Blueprint('alerts', __name__)

#------------------------------------------------------------
# Get alerts by user_id
@alerts.route('/<int:user_id>', methods=['GET'])
def get_alert(user_id):
    cursor = db.get_db().cursor()
    cursor.execute('''SELECT * FROM heart_rate_alerts WHERE user_id = %s''', (user_id,)
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

