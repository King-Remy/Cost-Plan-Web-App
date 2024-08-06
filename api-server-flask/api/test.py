from __future__ import print_function

import os
import glob
import json
import operator
import threading

from collections import defaultdict, namedtuple

from werkzeug.middleware.proxy_fix import ProxyFix
from flask import Flask, session, request, send_file, render_template, abort, jsonify, redirect, url_for, make_response, send_from_directory

from flask_cors import CORS
from flask_basicauth import BasicAuth
from flasgger import Swagger

from flask_restx import Resource, Api, fields
from datetime import datetime, timezone, timedelta
import jwt
import os
import glob
import json
import operator
import threading
import requests

from functools import wraps
import threading
import utils
import worker
import models
import config
# from models import Session, initialize, Users, JWTTokenBlocklist, Model, File, Base
import models
from werkzeug.security import generate_password_hash


app = Flask(__name__)

DEVELOPMENT = os.environ.get('environment', 'production').lower() == 'development'
WITH_REDIS = os.environ.get('with_redis', 'false').lower() == 'true'

# app.config['SESSION_TYPE'] = 'filesystem'
# app.config['SECRET_KEY'] = config.BaseConfig.SECRET_KEY
app.config.from_object('config.BaseConfig')

# Existing Flask-Restx API setup from 'routes.py'
rest_api = Api(app, version="1.0", title="Users API")

if not DEVELOPMENT and os.path.exists("/version"):
    PIPELINE_POSTFIX = "." + open("/version").read().strip()
else:
    PIPELINE_POSTFIX = ""


if not DEVELOPMENT:
    # In some setups this proved to be necessary for url_for() to pick up HTTPS
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1)

CORS(app, supports_credentials=True)

# swagger = Swagger(app)


if DEVELOPMENT and not WITH_REDIS:
    redis_queue = None
else:
    from redis import Redis
    from rq import Queue
    
    redis = Redis(host=os.environ.get("REDIS_HOST", "localhost"))
    redis_queue = Queue(connection=redis, default_timeout=3600)

# Setup database
@app.before_first_request
def initialize_database():
    try:
        models.initialize()  # Initializes the database and creates tables based on models.py
    except Exception as e:

        print('> Error: DBMS Exception: ' + str(e) )

        # fallback to SQLite
        from sqlalchemy import create_engine
        BASE_DIR = os.path.abspath(os.path.dirname(__file__))
        app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'db.sqlite3')

        print('> Fallback to SQLite to',SQLALCHEMY_DATABASE_URI )
        # Reconfigure engine to use SQLite and re-initialize
        engine.dispose()  # Dispose the old engine which might be connected to a different DB
        engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=True)
        models.Base.metadata.bind = engine  # Bind the base metadata to the new engine
        models.initialize()  # Try initializing again with SQLite

"""
   Custom responses
"""

@app.after_request
def after_request(response):
    """
       Sends back a custom error with {"success", "msg"} format
    """

    if int(response.status_code) >= 400:
        response_data = json.loads(response.get_data())
        if "errors" in response_data:
            response_data = {"success": False,
                             "msg": list(response_data["errors"].items())[0][1]}
            response.set_data(json.dumps(response_data))
        response.headers.add('Content-Type', 'application/json')
    return response

# Register routes

"""
    Flask-Restx models for api request and response data
"""

signup_model = rest_api.model('SignUpModel', {"username": fields.String(required=True, min_length=2, max_length=32),
                                              "email": fields.String(required=True, min_length=4, max_length=64),
                                              "password": fields.String(required=True, min_length=4, max_length=16)
                                              })

login_model = rest_api.model('LoginModel', {"email": fields.String(required=True, min_length=4, max_length=64),
                                            "password": fields.String(required=True, min_length=4, max_length=16)
                                            })

user_edit_model = rest_api.model('UserEditModel', {"userID": fields.String(required=True, min_length=1, max_length=32),
                                                   "username": fields.String(required=True, min_length=2, max_length=32),
                                                   "email": fields.String(required=True, min_length=4, max_length=64)
                                                   })

"""
   Helper function for JWT token required
"""

def token_required(f):

    @wraps(f)
    def decorator(*args, **kwargs):

        token = None
        print(f"This is authorization{request.headers}")
        if "authorization" in request.headers:
            token = request.headers["authorization"]
            print(f"This is token here{token}")
        if not token:
            return {"success": False, "msg": "Valid JWT token is missing"}, 400

        try:
            data = jwt.decode(token, config.BaseConfig.SECRET_KEY, algorithms=["HS256"])
            print(f"This is data here{data}")
            with models.Session() as session:
                current_user = models.Users.get_by_email(data["email"])
                
                if not current_user:
                    return {"success": False,
                            "msg": "Sorry. Wrong auth token. This user does not exist."}, 400

                token_expired = session.query(models.JWTTokenBlocklist.id).filter_by(jwt_token=token).scalar()

                if token_expired is not None:
                    return {"success": False, "msg": "Token revoked."}, 400

                if not current_user.check_jwt_auth_active():
                    return {"success": False, "msg": "Token expired."}, 400
            print(f"This is current user email- {current_user}")
        except Exception as ex:
            print(f"Error decoding token: {ex}")
            return {"success": False, "msg": "Token is invalid"}, 400
        
        return f(current_user, *args, **kwargs)

    return decorator

def login_required(orig):
    @wraps(orig)
    def decorated_function(**kwargs):
        # user_data = session.get('user_data')
        if "id" in session.keys():
            user_data = session['user_data']
        else:
            print('it is not here')
            return jsonify({"error": "Unauthorized access"}), 403
        # user_data = session['user_data']

        return orig(user_data,**kwargs)
    return decorated_function


"""
    Flask-Restx routes
"""


@rest_api.route('/api/users/register')
class Register(Resource):
    """
       Creates a new user by taking 'signup_model' input
    """

    @rest_api.expect(signup_model, validate=True)
    def post(self):

        # Extract request data
        req_data = request.get_json()
        _username = req_data["username"]
        _email = req_data["email"]
        _password = req_data["password"]

        print(f"This is register data {req_data}")
        with models.Session() as session:
            # Check if user already exists
            user_exists = session.query(models.Users).filter_by(email=_email).first()
            if user_exists:
                return {"success": False, "msg": "Email already taken"}, 400

            # Create new user
            
            new_user = models.Users(username=_username, email=_email, jwt_auth_active=True)  # Assume active JWT auth on registration
            new_user.set_password(_password)
            session.add(new_user)
            session.commit()

            # Access new_user.id here while the session is still active
            new_user_id = new_user.id

        return {"success": True,
                "userID": new_user_id,
                "msg": "The user was successfully registered"}, 200


@rest_api.route('/api/users/login')
class Login(Resource):
    """
       Login user by taking 'login_model' input and return JWT token
    """

    @rest_api.expect(login_model, validate=True)
    def post(self):

        req_data = request.get_json()

        _email = req_data.get("email")
        _password = req_data.get("password")

        with models.Session() as db_session:
            # Check if user exists
            user_exists = db_session.query(models.Users).filter_by(email=_email).first()

            if not user_exists:
                return {"success": False,
                        "msg": "This email does not exist."}, 400

            if not user_exists.check_password(_password):
                return {"success": False,
                        "msg": "Wrong credentials."}, 400

            # create access token uwing JWT
            token = jwt.encode({'email': _email, 'exp': datetime.utcnow() + timedelta(minutes=30)}, config.BaseConfig.SECRET_KEY)

            user_exists.set_jwt_auth_active(True)

            user_exists_toJSON = user_exists.toJSON()
            
            
            db_session.commit()
            print(f"This is user exist JSON {user_exists.id}")
            print(f"This is the token {token}")
        
    
        # user_data = user_exists.id
        # session['user_data'] = user_data
        # print(f"This is session user_data {session['user_data']}")
        # session.modified = True       
        return {"success": True,
                "token": token,
                "user": user_exists_toJSON}, 200


@rest_api.route('/api/users/edit')
class EditUser(Resource):
    """
       Edits User's username or password or both using 'user_edit_model' input
    """

    @rest_api.expect(user_edit_model)
    @token_required
    def post(self, current_user):

        req_data = request.get_json()

        _new_username = req_data.get("username")
        _new_email = req_data.get("email")

        with models.Session() as session:
            # Fetch the user instance using the current_user's ID
            user = session.query(models.Users).filter_by(id=current_user.id).first()
            if not user:
                return {"success": False, "msg": "User not found."}, 404

            # Update the user details
            if _new_username:
                user.username = _new_username
            if _new_email:
                user.email = _new_email

            # Commit the changes to the database

            try:
                session.commit()
                return {"success": True}, 200
            except Exception as e:
                session.rollback()  # Rollback in case of any error
                return {"success": False, "msg": str(e)}, 500



@rest_api.route('/api/users/logout')
class LogoutUser(Resource):
    """
       Logs out User using 'logout_model' input
    """

    @token_required
    def post(self, current_user):

        _jwt_token = request.headers["authorization"]

        with models.Session() as session:
            jwt_block = models.JWTTokenBlocklist(jwt_token=_jwt_token, created_at=datetime.utcnow())
            session.add(jwt_block)

            # Update the user's JWT authentication status
            user = session.query(models.Users).filter_by(id=current_user.id).first()
            
            if user:
                user.jwt_auth_active = False
                try:
                    session.commit()
                    return {"success": True, "msg": "Logged out successfully."}, 200
                except Exception as e:
                    session.rollback()  # Rollback in case of any error
                    return {"success": False, "msg": "Error logging out."}, 500
            else:
                return {"success": False, "msg": "User not found."}, 404


@app.route('/api/dashboard', methods=['GET'])
def get_main():
    return ""



def process_upload(filewriter, callback_url=None):
    id = utils.generate_id()
    d = utils.storage_dir_for_id(id)
    os.makedirs(d)
    
    filewriter(os.path.join(d, id+".ifc"))
    

    session = models.Session()
    session.add(models.Model(id, ''))
    session.commit()
    session.close()
    
    if redis_queue is None:
        t = threading.Thread(target=lambda: worker.process(id, callback_url))
        t.start()
    else:
        redis_queue.enqueue(worker.process, id, callback_url)

    return id
    


def process_upload_multiple(files, user_id, callback_url=None):
    id = utils.generate_id()
    d = utils.storage_dir_for_id(id)
    os.makedirs(d)

    file_id = 0
    session = models.Session()
    m = models.Model(id, '', user_id)
    session.add(m)

    for file in files:
        fn = file.filename
        def filewriter(fn): return file.save(fn)
        filewriter(os.path.join(d, id+"_"+str(file_id)+".ifc"))
        file_id += 1
        m.files.append(models.File(id, fn))

    session.commit()
    session.close()

    if redis_queue is None:
        t = threading.Thread(target=lambda: worker.process(id, callback_url))
        t.start()        
    else:
        redis_queue.enqueue(worker.process, id, callback_url)

    return id



@app.route('/api/dashboard', methods=['POST'])

def put_main():
    """
    Upload model
    ---
    requestBody:
      content:
        multipart/form-data:
          schema:
            type: object
            properties:
              ifc:
                type: string
                format: binary
    responses:
      '200':
        description: redirect
    """
    # print(request.files.getlist('file'))
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    files = request.files.getlist('file')

    if files:
        ids = process_upload_multiple(files)
        return jsonify({"id": ids}), 200
    else:
        return jsonify({"error": "No files provided"}), 400
    # if request.accept_mimetypes.accept_json:
    #     return jsonify({"url":url})
    # else:
    #     return redirect(url)


@app.route('/api/p/<id>', methods=['GET'])
def check_viewer(id):
    if not utils.validate_id(id):
        abort(404)
    return render_template('progress.html', id=id)    
    
    
@app.route('/api/pp/<id>', methods=['GET'])
def get_progress(id):
    if not utils.validate_id(id):
        abort(404)
    session = models.Session()
    model = session.query(models.Model).filter(models.Model.code == id).all()[0]
    session.close()
    return jsonify({"progress": model.progress})

@app.route('/log/<id>.<ext>', methods=['GET'])
def get_log(id, ext):
    log_entry_type = namedtuple('log_entry_type', ("level", "message", "instance", "product"))
    
    if ext not in {'html', 'json'}:
        abort(404)
        
    if not utils.validate_id(id):
        abort(404)
    logfn = os.path.join(utils.storage_dir_for_id(id), "log.json")
    if not os.path.exists(logfn):
        abort(404)
            
    if ext == 'html':
        log = []
        for ln in open(logfn):
            l = ln.strip()
            if l:
                log.append(json.loads(l, object_hook=lambda d: log_entry_type(*(d.get(k, '') for k in log_entry_type._fields))))
        return render_template('log.html', id=id, log=log)
    else:
        return send_file(logfn, mimetype='text/plain')


@app.route('/api/v/<id>', methods=['GET'])
@app.route('/live/<id>/<channel>', methods=['GET'])
def get_viewer(id, channel=None):
    if not utils.validate_id(id):
        abort(404)
    d = utils.storage_dir_for_id(id)
    
    if not os.path.exists(d):
        abort(404)
    
    ifc_files = [os.path.join(d, name) for name in os.listdir(d) if os.path.isfile(os.path.join(d, name)) and name.endswith('.ifc')]
    
    if len(ifc_files) == 0:
        abort(404)
    
    failedfn = os.path.join(utils.storage_dir_for_id(id), "failed")
    if os.path.exists(failedfn):
        return render_template('error.html', id=id)

    for ifc_fn in ifc_files:
        glbfn = ifc_fn.replace(".ifc", ".glb")
        if not os.path.exists(glbfn):
            abort(404)
            
    n_files = len(ifc_files) if "_" in ifc_files[0] else None
                    
    return render_template(
        'viewer.html',
        id=id,
        n_files=n_files,
        postfix=PIPELINE_POSTFIX,
        with_screen_share=config.with_screen_share,
        live_share_id=channel or utils.generate_id(),
        mode='listen' if channel else 'view'
    )


@app.route('/m/<fn>', methods=['GET'])
def get_model(fn):
    """
    Get model component
    ---
    parameters:
        - in: path
          name: fn
          required: true
          schema:
              type: string
          description: Model id and part extension
          example: BSESzzACOXGTedPLzNiNklHZjdJAxTGT.glb
    """
    
 
    id, ext = fn.split('.', 1)
    
    if not utils.validate_id(id):
        abort(404)
  
    if ext not in {"xml", "svg", "glb", "unoptimized.glb", "tree.json"}:
        abort(404)
   
    path = utils.storage_file_for_id(id, ext)    

    if not os.path.exists(path):
        abort(404)
        
    if os.path.exists(path + ".gz"):
        import mimetypes
        response = make_response(
            send_file(path + ".gz", 
                mimetype=mimetypes.guess_type(fn, strict=False)[0])
        )
        response.headers['Content-Encoding'] = 'gzip'
        return response
    else:
        return send_file(path)

        
@app.route('/live/<channel>', methods=['POST'])
def post_live_viewer_update(channel):
    # body = request.get_json(force=True)
    # @todo validate schema?
    # body = json.dumps(body)
    body = request.data.decode('ascii');
    redis.publish(channel=f"live_{channel}", message=body)
    return ""


@app.route('/static/<path:filename>')
def static_handler(filename):
    # filenames = [os.path.join(root, fn)[len("static")+1:] for root, dirs, files in os.walk("static", topdown=False) for fn in files]
    if filename.startswith("bimsurfer/"):
        return send_from_directory("bimsurfer", "/".join(filename.split("/")[1:]))
    else:
        return send_from_directory("static", filename)


@app.route('/live/<channel>', methods=['GET'])
def get_viewer_update(channel):
    def format(obj):
        return f"data: {obj.decode('ascii')}\n\n"

    def stream():
        pubsub = redis.pubsub()
        pubsub.subscribe(f"live_{channel}")
        try:
            msgs = pubsub.listen()
            yield from map(format, \
                map(operator.itemgetter('data'), \
                filter(lambda x: x.get('type') == 'message', msgs)))
        finally:
            import traceback
            traceback.print_exc()
            try: pubsub.unsubscribe(channel)
            except: pass
    
    return app.response_class(
        stream(),
        mimetype='text/event-stream',
        headers={'X-Accel-Buffering': 'no', 'Cache-Control': 'no-cache'},
    )

@app.route('/api/models_paginated/<start>/<end>', methods=['GET'])
@login_required
def models_paginated(user_data, start, end, commit_id=None):

    # Retrieve user data
    with models.Session() as session:
        saved_models = [m.serialize() for m in session.query(models.Model).filter(models.Model.user_id==user_data.id).filter(models.Model.deleted!=1).order_by(models.Model.id.desc()).slice(int(start),int(end)).all()]
        count = session.query(models.Model).filter(models.Model.user_id==user_data.id).filter(models.Model.deleted!=1).count()
    return jsonify({"models":saved_models, "count":count})

@app.route('/api/download/<id>', methods=['GET'])
@login_required
def download_model(user_data, id):
    with models.Session() as session:
        model = session.query(models.Model).filter(models.Model.id == id).all()[0]
        if model.user_id != user_data.id:
            abort(403)
        code = model.code
    path = utils.storage_file_for_id(code, "ifc")

    return send_file(path, download_name=model.filename, as_attachment=True, conditional=True)

@app.route('/api/delete/<id>', methods=['POST'])
@login_required
def delete(user_data, id):
    ids = [int(i) for i in id.split('.')]
    with models.Session() as session:
        _models = session.query(models.Model).filter(models.Model.id.in_(ids)).all()
        if set(m.user_id for m in models) != {user_data["id"]}:
            abort(403)
        for model in _models:
            model.deleted = 1
        session.commit()
    return jsonify({"status":"success", "id":id})