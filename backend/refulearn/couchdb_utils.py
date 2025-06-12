import couchdb
from django.conf import settings
import urllib.parse

COUCHDB_CONFIG = settings.COUCHDB

# Connect to CouchDB server
def get_couchdb_server():
    user = COUCHDB_CONFIG['USER']
    password = urllib.parse.quote(COUCHDB_CONFIG['PASSWORD'])
    host = COUCHDB_CONFIG['HOST']
    port = COUCHDB_CONFIG['PORT']
    url = f'http://{user}:{password}@{host}:{port}/'
    return couchdb.Server(url)

# Get or create the user database
def get_user_db():
    server = get_couchdb_server()
    db_name = COUCHDB_CONFIG['DB_NAME'] + '_users'
    if db_name in server:
        db = server[db_name]
    else:
        db = server.create(db_name)
    return db

# Get or create the course database
def get_course_db():
    server = get_couchdb_server()
    db_name = COUCHDB_CONFIG['DB_NAME'] + '_courses'
    if db_name in server:
        db = server[db_name]
    else:
        db = server.create(db_name)
    return db

# Get or create the language database
def get_language_db():
    server = get_couchdb_server()
    db_name = COUCHDB_CONFIG['DB_NAME'] + '_languages'
    if db_name in server:
        db = server[db_name]
    else:
        db = server.create(db_name)
    return db

# Get or create the category database
def get_category_db():
    server = get_couchdb_server()
    db_name = COUCHDB_CONFIG['DB_NAME'] + '_categories'
    if db_name in server:
        db = server[db_name]
    else:
        db = server.create(db_name)
    return db

# Get or create the camp database
def get_camp_db():
    server = get_couchdb_server()
    db_name = COUCHDB_CONFIG['DB_NAME'] + '_camps'
    if db_name in server:
        db = server[db_name]
    else:
        db = server.create(db_name)
    return db

# Get or create the job database
def get_job_db():
    server = get_couchdb_server()
    db_name = COUCHDB_CONFIG['DB_NAME'] + '_jobs'
    if db_name in server:
        db = server[db_name]
    else:
        db = server.create(db_name)
    return db

# Get or create the job application database
def get_job_application_db():
    server = get_couchdb_server()
    db_name = COUCHDB_CONFIG['DB_NAME'] + '_job_applications'
    if db_name in server:
        db = server[db_name]
    else:
        db = server.create(db_name)
    return db

# Get or create the assessment database
def get_assessment_db():
    server = get_couchdb_server()
    db_name = COUCHDB_CONFIG['DB_NAME'] + '_assessments'
    if db_name in server:
        db = server[db_name]
    else:
        db = server.create(db_name)
    return db

# Get or create the user assessment database
def get_user_assessment_db():
    server = get_couchdb_server()
    db_name = COUCHDB_CONFIG['DB_NAME'] + '_user_assessments'
    if db_name in server:
        db = server[db_name]
    else:
        db = server.create(db_name)
    return db

# Get or create the certificate database
def get_certificate_db():
    server = get_couchdb_server()
    db_name = COUCHDB_CONFIG['DB_NAME'] + '_certificates'
    if db_name in server:
        db = server[db_name]
    else:
        db = server.create(db_name)
    return db

# Get or create the discussion database
def get_discussion_db():
    server = get_couchdb_server()
    db_name = COUCHDB_CONFIG['DB_NAME'] + '_discussions'
    if db_name in server:
        db = server[db_name]
    else:
        db = server.create(db_name)
    return db

# Get or create the discussion reply database
def get_discussion_reply_db():
    server = get_couchdb_server()
    db_name = COUCHDB_CONFIG['DB_NAME'] + '_discussion_replies'
    if db_name in server:
        db = server[db_name]
    else:
        db = server.create(db_name)
    return db

def get_peer_learning_session_db():
    db_name = f"{COUCHDB_CONFIG['db_name']}_peer_learning_sessions"
    if db_name in couch:
        return couch[db_name]
    else:
        return couch.create(db_name)

def get_peer_learning_participant_db():
    db_name = f"{COUCHDB_CONFIG['db_name']}_peer_learning_participants"
    if db_name in couch:
        return couch[db_name]
    else:
        return couch.create(db_name) 