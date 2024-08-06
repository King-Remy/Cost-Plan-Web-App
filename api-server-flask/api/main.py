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
import config
# from models import Session, initialize, Users, JWTTokenBlocklist, Model, File, Base
import models
from werkzeug.security import generate_password_hash
from flask_session import Session

app = Flask(__name__)

DEVELOPMENT = os.environ.get('environment', 'production').lower() == 'development'
WITH_REDIS = os.environ.get('with_redis', 'false').lower() == 'true'

app.config.from_object('config.BaseConfig')
# app.config['SESSION_TYPE'] = 'filesystem'
# app.config['SECRET_KEY'] = config.BaseConfig.SECRET_KEY
MULTIPLE = 1
SINGLE = 0

# Existing Flask-Restx API setup from 'routes.py'
rest_api = Api(app, version="1.0", title="Users API")
# Session(app)
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
            current_user = models.Users.get_by_email(data["email"])
            print(f"This is current user {current_user}")
            with models.Session() as session:
                
                
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

        # Check if user already exists
        user_exists = models.Users.get_by_email(_email)
        if user_exists:
            return {"success": False, "msg": "Email already taken"}, 400

        # Create new user
        
        new_user = models.Users(username=_username, email=_email)  # Assume active JWT auth on registration
        new_user.set_password(_password)
        new_user.save()

        return {"success": True,
                "userID": new_user.id,
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


        # Check if user exists
        user_exists = models.Users.get_by_email(_email)

        if not user_exists:
            return {"success": False,
                    "msg": "This email does not exist."}, 400

        if not user_exists.check_password(_password):
            return {"success": False,
                    "msg": "Wrong credentials."}, 400

        # create access token uwing JWT
        token = jwt.encode({'email': _email, 'exp': datetime.utcnow() + timedelta(minutes=240)}, config.BaseConfig.SECRET_KEY)

        user_exists.set_jwt_auth_active(True)

        user_exists.save()
        
        print(f"This is user exist JSON {user_exists.toJSON()}")
        
        print(f"This is the token {token}")
        
    
        # user_data = user_exists.id
        # session['user_data'] = user_data
        # print(f"This is session user_data {session['user_data']}")
        # session.modified = True       
        return {"success": True,
                "token": token,
                "user": user_exists.toJSON()}, 200


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

        if _new_username:
            self.update_username(_new_username)

        if _new_email:
            self.update_email(_new_email)

        self.save()

        return {"success": True}, 200



@rest_api.route('/api/users/logout')
class LogoutUser(Resource):
    """
       Logs out User using 'logout_model' input
    """

    @token_required
    def post(self, current_user):

        _jwt_token = request.headers["authorization"]

        jwt_block = models.JWTTokenBlocklist(jwt_token=_jwt_token, created_at=datetime.now(timezone.utc))
        jwt_block.save()

        self.set_jwt_auth_active(False)
        self.save()


@app.route('/api/dashboard', methods=['GET'])
def get_main():
    return ""



def process_upload(files, user_id, callback_url=None):
    id = utils.generate_id()
    d = utils.storage_dir_for_id(id)
    os.makedirs(d)
   
    file_id = 0
    session = models.Session()
    m = models.Model(id, '', user_id)   
    session.add(m)
  
    for file in files:
        fn = file.filename
        filewriter = lambda fn: file.save(fn)
        filewriter(os.path.join(d, id+"_"+str(file_id)+".ifc"))
        file_id += 1
        m.files.append(models.File(id, fn, user_id))
    
    session.commit()
    session.close()
    
    if redis_queue is None:
        t = threading.Thread(target=lambda: worker.process(id, callback_url))
        t.start()        
    else:
        redis_queue.enqueue(worker.process, id, callback_url)

    return id
    


def process_upload_multiple(files, user_id, callback_url=None):
    ids = []
    filenames = []
    with models.Session() as session:
        

        for file in files:
            id = utils.generate_id()
            d = utils.storage_dir_for_id(id)
            fn = file.filename
            

            filenames.append(fn)
            ids.append(id)

            os.makedirs(d)
            file.save(os.path.join(d, id+".ifc"))

            session.add(models.Model(id, fn, user_id))
            # session.add(models.File(id, fn, user_id))
        session.commit()
        # session.commit()

    if redis_queue is None:
        for id in ids:
            t = threading.Thread(target=lambda: worker.process(id, callback_url))
            t.start()        
    else:
        for id in ids:
            redis_queue.enqueue(worker.process, id, callback_url)

    return ids



@app.route('/api/dashboard', methods=['POST'])
@token_required
def put_main(current_user):
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
    user_data = current_user.toJSON()
    print(f" This is current user here - {user_data.keys()}")
    # print(request.files.getlist('file'))
    user_id=user_data['id']
    print(f" This is current user here - {user_id}")
    ids = []
    files = []
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    print(f" This is files: {request.files.items()}")
    files = request.files.getlist('file')
    print(f" This is files: {files}")

    if MULTIPLE:
        ids = process_upload_multiple(files, user_id)

        url = "/estimate"
    
    # if SINGLE:
    #     id = process_upload(files, user_id)
    

    if request.accept_mimetypes.accept_json:
        print(f"This is url: -{url}")
        return jsonify({"url":url}), 200
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

@app.route('/api/models_paginated/<start>/<end>', methods=['GET'])
@token_required
def models_paginated(current_user, start, end, commit_id=None):
    user_data = current_user.toJSON()
    user_id=user_data['id']
    # Retrieve user data
    with models.Session() as session:
        saved_models = [m.serialize() for m in session.query(models.Model).filter(models.Model.user_id==user_id).filter(models.Model.deleted!=1).order_by(models.Model.id.desc()).slice(int(start),int(end)).all()]
        count = session.query(models.Model).filter(models.Model.user_id==user_id).filter(models.Model.deleted!=1).count()

    
    print(f"These are the models:{saved_models}")
    return jsonify({"models":saved_models, "count":count})

@app.route('/api/download/<id>', methods=['GET'])
@token_required
def download_model(current_user, id):
    user_data = current_user.toJSON()
    user_id=user_data['id']
    with models.Session() as session:
        model = session.query(models.Model).filter(models.Model.id == id).all()[0]
        if model.user_id != user_id:
            abort(403)
        code = model.code
    path = utils.storage_file_for_id(code, "ifc")

    return send_file(path, download_name=model.filename, as_attachment=True, conditional=True)

@app.route('/api/delete/<id>', methods=['POST'])
@token_required
def delete(current_user, id):
    ids = [int(i) for i in id.split('.')]
    user_data = current_user.toJSON()
    user_id=user_data['id']
    with models.Session() as session:
        _models = session.query(models.Model).filter(models.Model.id.in_(ids)).all()
        if set(m.user_id for m in _models) != {user_id}:
            abort(403)
        for model in _models:
            model.deleted = 1
        session.commit()
    return jsonify({"status":"success", "id":id})

# New endpoint to fetch elements from the .glb file
@app.route('/api/model_elements/<id>', methods=['GET'])
@token_required
def get_model_elements(current_user, id):
    user_data = current_user.toJSON()
    user_id = user_data['id']

    print(f"This is ID: - {user_id}")
    with models.Session() as session:
        model = session.query(models.Model).filter(models.Model.id == id).all()[0]
        if not model or model.user_id != user_id:
            return jsonify({"success": False, "msg": "Model not found or access denied"}), 403
        code = model.code

    ifc_path = utils.storage_file_for_id(code, "ifc")
    if not os.path.exists(ifc_path):
        return jsonify({"success": False, "msg": "IFC file not found"}), 404

    elements = worker.get_elements_from_glb(ifc_path)

    print(f"This is element: - {elements}")
    
    return jsonify({
        'success': True,
        'elements': elements,
        'code': code
    }), 200

# New endpoint to save family data
@app.route('/save_family_data', methods=['POST'])
def save_family_data():
    data = request.json
    family = data.get('family')
    model_code = data.get('model_code')
    rows = data.get('rows', [])

    with models.Session() as session:
        for row in rows:
            type_ = row.get('type')
            area = row.get('area')
            volume = row.get('volume')
            length = row.get('length')
            thickness = row.get('thickness')

            # Check if the row already exists
            existing_row = session.query(models.FamilyData).filter_by(family=family, type=type_, code=model_code).first()
            if existing_row:
                # Update existing row
                existing_row.area = area
                existing_row.volume = volume
                existing_row.length = length
                existing_row.thickness = thickness
            else:
                # Create new row
                new_row = models.FamilyData(
                    family=family,
                    type=type_,
                    area=area,
                    volume=volume,
                    thickness=thickness,
                    model_code=model_code
                )
                session.add(new_row)

        session.commit()
    return jsonify({'message': 'Data saved successfully'}), 200

