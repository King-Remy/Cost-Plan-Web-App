import os, random, string
from datetime import timedelta

import os
import json

from multiprocessing import cpu_count

import jsonschema

BASE_DIR = os.path.dirname(os.path.realpath(__file__))
# parse configuration file
_config = json.load(open(os.path.join(os.path.dirname(__file__), "config.json")))

# parse configuration schema and validate _config
schema = json.load(open(os.path.join(os.path.dirname(__file__), "config.schema")))

jsonschema.validate(schema=schema, instance=_config)

# returns true if task is enabled in _config
task_enabled = lambda nm: nm.__name__ in _config['tasks']
treeview_label = _config['treeview']['label']
with_screen_share = _config['features'].get("screen_share", {}).get("enabled", False)
num_threads = _config['performance']['num_threads']
if num_threads == 'auto':
    num_threads = max(1, cpu_count() // _config['performance']['num_workers'])
    
class BaseConfig():
    
    SECRET_KEY = os.getenv('SECRET_KEY', None)
    if not SECRET_KEY:
        SECRET_KEY = ''.join(random.choice( string.ascii_lowercase  ) for i in range( 32 ))

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', None)
    if not JWT_SECRET_KEY:
        JWT_SECRET_KEY = ''.join(random.choice( string.ascii_lowercase  ) for i in range( 32 ))

    GITHUB_CLIENT_ID     = os.getenv('GITHUB_CLIENT_ID' , None)
    GITHUB_CLIENT_SECRET = os.getenv('GITHUB_SECRET_KEY', None)
    
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    DB_ENGINE   = os.getenv('DB_ENGINE'   , None)
    DB_USERNAME = os.getenv('DB_USERNAME' , None)
    DB_PASS     = os.getenv('DB_PASS'     , None)
    DB_HOST     = os.getenv('DB_HOST'     , None)
    DB_PORT     = os.getenv('DB_PORT'     , None)
    DB_NAME     = os.getenv('DB_NAME'     , None)

    USE_SQLITE  = True 

    # try to set up a Relational DBMS
    if DB_ENGINE and DB_NAME and DB_USERNAME:

        try:
            
            # Relational DBMS: PSQL, MySql
            SQLALCHEMY_DATABASE_URI = '{}://{}:{}@{}:{}/{}'.format(
                DB_ENGINE,
                DB_USERNAME,
                DB_PASS,
                DB_HOST,
                DB_PORT,
                DB_NAME
            ) 

            USE_SQLITE  = False

        except Exception as e:

            print('> Error: DBMS Exception: ' + str(e) )
            print('> Fallback to SQLite ')    

    if USE_SQLITE:

        # This will create a file in <app> FOLDER
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'db.sqlite3')
        DEBUG=False
        SQLALCHEMY_ECHO=False

