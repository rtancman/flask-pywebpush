from flask import Flask
from flask_cors import CORS

from flaskwebpush.webpush.api import api


app = Flask(__name__)


def init_webapp():
    """Initialize the web application."""
    app.config.from_object('flaskwebpush.config')

    app.register_blueprint(api, url_prefix='/api')

    # Initialize Flask-CORS
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

    # Initialize Flask-Security
    # user_datastore = SQLAlchemyUserDatastore(db, User, Role)
    # Security(app, user_datastore)

    # Initialize Flask-SQLAlchemy
    # db.app = app
    # db.init_app(app)
    # db.create_all()

    # Initialize Flask-Restless
    #manager = APIManager(
    #  app,
    #  flask_sqlalchemy_db=db,
    #  preprocessors=dict(GET_MANY=[restless_api_auth_func]),
    #)
    #manager.create_api(Employee, methods=['GET', 'POST', 'OPTIONS'])
    return app
