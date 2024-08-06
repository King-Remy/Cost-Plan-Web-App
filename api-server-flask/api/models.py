from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, func, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, scoped_session
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.inspection import inspect
from sqlalchemy_utils import database_exists, create_database
from werkzeug.security import generate_password_hash, check_password_hash
import os
from config import BaseConfig  # Import configuration settings


# Determine if the database is SQLite and adjust accordingly
if BaseConfig.SQLALCHEMY_DATABASE_URI.startswith("sqlite://"):
    engine = create_engine(
        BaseConfig.SQLALCHEMY_DATABASE_URI,
        connect_args={'check_same_thread': False}
    )
else:
    # Initialize engine using SQLALCHEMY_DATABASE_URI from config.py
    engine = create_engine(BaseConfig.SQLALCHEMY_DATABASE_URI, echo=True)

# engine = create_engine(BaseConfig.SQLALCHEMY_DATABASE_URI, echo=True)


Session = scoped_session(sessionmaker(bind=engine))
session = Session()
Base = declarative_base()

class Serializable(object):
    def serialize(self, full=False):
        # Transforms data from dataclasses to a dict,
        # storing primary key of references and handling date format
        d = {}
        for attribute in inspect(self).attrs.keys():
            if isinstance(getattr(self, attribute), (list, tuple)):
                if full:
                    d[attribute] = [element.serialize(full) for element in getattr(self, attribute)]
                else:
                    d[attribute] = [element.id for element in getattr(self, attribute)]
            elif isinstance(getattr(self, attribute), datetime):
                d[attribute] = getattr(self, attribute).strftime("%Y-%m-%d %H:%M:%S")
            else:
                d[attribute] = getattr(self, attribute)
        return d

class File(Base, Serializable):
    __tablename__ = 'files'

    id = Column(Integer, primary_key=True)
    code = Column(String)
    filename = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    model_id = Column(Integer, ForeignKey('models.id'))
    progress = Column(Integer, default=-1)
    date = Column(DateTime, default=datetime.utcnow)

    deleted = Column(Integer, default=0)

    def __init__(self, code, filename, user_id):
        self.code = code
        self.filename = filename
        self.user_id = user_id
        
        self.model_id = Column(Integer, ForeignKey('models.id'))

class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(32), nullable=False)
    email = Column(String(64), nullable=True)
    password = Column(String)
    jwt_auth_active = Column(Boolean)
    date_joined = Column(DateTime, default=datetime.utcnow)
    models = relationship("Model")

    def __repr__(self):
        return f"<User {self.username}>"
    
    def save(self):
        session.add(self)
        session.commit()

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def update_email(self, new_email):
        self.email = new_email
        session.commit()

    def update_username(self, new_username):
        self.username = new_username
        session.commit()

    def check_jwt_auth_active(self):
        return self.jwt_auth_active

    def set_jwt_auth_active(self, set_status):
        self.jwt_auth_active = set_status
        session.commit()

    @classmethod
    def get_by_id(cls, id):
        return session.query(cls).get(id)

    @classmethod
    def get_by_email(cls, email):
        return session.query(cls).filter(cls.email==email).first()

    @classmethod
    def get_by_username(cls, username):
        return session.query(cls).filter(cls.username==username).first()

    def toDICT(self):
        cls_dict = {}
        cls_dict['id'] = self.id
        cls_dict['username'] = self.username
        cls_dict['email'] = self.email

        return cls_dict

    def toJSON(self):
        return self.toDICT()

class Model(Base, Serializable):
    __tablename__ = 'models'

    id = Column(Integer, primary_key=True)
    code = Column(String)
    filename = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    files = relationship("File")
    estimates = relationship("Estimate")
    progress = Column(Integer, default=-1)
    date = Column(DateTime, default=datetime.utcnow)
    deleted = Column(Integer, default=0)
    
    def __init__(self, code, filename, user_id):
        self.code = code
        self.filename = filename
        self.user_id = user_id

class Estimate(Base, Serializable):
    __tablename__ = 'estimate_details'

    code = Column(String, ForeignKey('models.code'))
    id = Column(Integer, primary_key=True)
    reference_number = Column(String(32), unique=True)
    name = Column(String(128))
    description = Column(String(256))
    created_date = Column(DateTime, default=datetime.utcnow)
    building_type = Column(String(64))
    user_id = Column(Integer, ForeignKey('users.id'))
    model = relationship("Model")

    # Client details
    client_name = Column(String(128))
    client_address = Column(String(256))
    client_city = Column(String(64))
    client_state = Column(String(64))
    client_postcode = Column(String(16))
    client_email = Column(String(64))
    client_mobile = Column(String(32))
    client_phone = Column(String(32))

    def __init__(self, reference_number, name, description, building_type, user_id, code, client_name, 
                 client_address, client_city, client_state, client_postcode, client_email, 
                 client_mobile, client_phone):
        self.reference_number = reference_number
        self.name = name
        self.description = description
        self.building_type = building_type
        self.user_id = user_id
        self.code = code
        self.client_name = client_name
        self.client_address = client_address
        self.client_city = client_city
        self.client_state = client_state
        self.client_postcode = client_postcode
        self.client_email = client_email
        self.client_mobile = client_mobile
        self.client_phone = client_phone

    def update(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        session.commit()

    @classmethod
    def get_by_id(cls, id):
        return session.query(cls).get(id)

    @classmethod
    def get_by_reference_number(cls, reference_number):
        return session.query(cls).filter(cls.reference_number == reference_number).first()
    
class FamilyData(Base, Serializable):
    __tablename__ = 'family_data'

    id = Column(Integer, primary_key=True)
    family = Column(String, nullable=False)
    type = Column(String, nullable=False)
    area = Column(Float, nullable=True)
    volume = Column(Float, nullable=True)
    length = Column(Float, nullable=True)
    thickness = Column(Float, nullable=True)
    code = Column(String, ForeignKey('models.code'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_date = Column(DateTime, default=datetime.utcnow)
    updated_date = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("Users")
    model = relationship("Model")

    def __init__(self, family, type, area, volume, length, thickness, code, user_id):
        self.family = family
        self.type = type
        self.area = area
        self.volume = volume
        self.length = length
        self.thickness = thickness
        self.code = code
        self.user_id = user_id

class JWTTokenBlocklist(Base):
    __tablename__ = 'jwt_token_blocklist'

    id = Column(Integer, primary_key=True)
    jwt_token = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"Expired Token: {self.jwt_token}>"

    def save(self):
        session.add(self)
        session.commit()

def initialize():
    if not database_exists(engine.url):
        create_database(engine.url)
    Base.metadata.create_all(engine)

if __name__ == "__main__":
    initialize()
