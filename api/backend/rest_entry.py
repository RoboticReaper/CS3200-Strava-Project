from flask import Flask

from backend.db_connection import db
from backend.runs.runs_routes import runs
from backend.users.users_routes import users
from backend.simple.simple_routes import simple_routes
from backend.posts.posts_routes import posts
from backend.alerts.alerts_routes import alerts
from backend.hidden.hidden_routes import hidden
from backend.groups.groups_routes import groups
import os
from dotenv import load_dotenv

from flask_cors import CORS



def create_app():
    app = Flask(__name__)
    CORS(app)

    # Load environment variables
    # This function reads all the values from inside
    # the .env file (in the parent folder) so they
    # are available in this file.  See the MySQL setup 
    # commands below to see how they're being used.
    load_dotenv()

    # secret key that will be used for securely signing the session 
    # cookie and can be used for any other security related needs by 
    # extensions or your application
    # app.config['SECRET_KEY'] = 'someCrazyS3cR3T!Key.!'
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    # # these are for the DB object to be able to connect to MySQL. 
    # app.config['MYSQL_DATABASE_USER'] = 'root'
    app.config['MYSQL_DATABASE_USER'] = os.getenv('DB_USER').strip()
    app.config['MYSQL_DATABASE_PASSWORD'] = os.getenv('MYSQL_ROOT_PASSWORD').strip()
    app.config['MYSQL_DATABASE_HOST'] = os.getenv('DB_HOST').strip()
    app.config['MYSQL_DATABASE_PORT'] = int(os.getenv('DB_PORT').strip())
    app.config['MYSQL_DATABASE_DB'] = os.getenv('DB_NAME').strip()  # Change this to your DB name

    # Initialize the database object with the settings above. 
    app.logger.info('current_app(): starting the database connection')
    db.init_app(app)


    # Register the routes from each Blueprint with the app object
    # and give a url prefix to each
    app.logger.info('current_app(): registering blueprints with Flask app object.')   
    app.register_blueprint(simple_routes)
    app.register_blueprint(runs, url_prefix='/runs')
    app.register_blueprint(users, url_prefix='/users')
    app.register_blueprint(posts, url_prefix='/posts')
    app.register_blueprint(alerts, url_prefix='/alerts')
    app.register_blueprint(hidden, url_prefix='/hidden')
    app.register_blueprint(groups, url_prefix='/groups')


    # Don't forget to return the app object
    return app

