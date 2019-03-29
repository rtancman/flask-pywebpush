import os


# # Define the application directory
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Statement for enabling the development environment
DEBUG = True
TESTING = False
ENV = 'development'

# # Define the database - we are working with
# # SQLite for this example
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'app.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False
DATABASE_CONNECT_OPTIONS = {}

# # Application threads. A common general assumption is
# # using 2 per available processor cores - to handle
# # incoming requests using one and performing background
# # operations using the other.
THREADS_PER_PAGE = 2

# # Enable protection agains *Cross-site Request Forgery (CSRF)*
CSRF_ENABLED = True

# # Use a secure, unique and absolutely secret key for
# # signing the data.
CSRF_SESSION_KEY = "secret"

WTF_CSRF_ENABLED = False

# # Secret key for signing cookies
SECRET_KEY = "secret"

CORS_HEADERS = 'Content-Type'
SECURITY_TOKEN_MAX_AGE = 60
SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Auth-Token'
SECURITY_POST_LOGIN_VIEW = 'http://127.0.0.1:4200'
