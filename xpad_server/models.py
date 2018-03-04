import base64
import datetime
import hashlib
import random
from contextlib import contextmanager

import flask
import time
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from xpad_server.token_manager import generate_token, decode_token, generate_invite_token, ExpiredTokenException, \
    validate_not_expired, ensure_bytes, sha256
from xpad_server.flask_filters import MyFilters
db = SQLAlchemy()
login_manager = LoginManager()
def init_app(app, uri=None):
    db.app = app
    if uri:
        app.config['SQLALCHEMY_DATABASE_URI'] = uri
    db.init_app(app)
    login_manager.init_app(app)
    MyFilters.init_app(app)
    return db;





class RoomUser(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    room_id=db.Column(db.Integer)
    username=db.Column(db.String(40))
    realname=db.Column(db.String(100))
    email=db.Column(db.String(100),default=lambda:"%s@anon.com"%(datetime.datetime.now().isoformat()))
    ip_address=db.Column(db.String(20),default="<unknown>")
    state = db.Column(db.String(15), default="undefined")
    is_anon=db.Column(db.Boolean,default=False)
    is_admin=db.Column(db.Boolean,default=False)
    admin_id=db.Column(db.Integer,nullable=True,default=None)
    joined_at=db.Column(db.DateTime,default=None,nullable=True)
    last_activity=db.Column(db.DateTime,nullable=True,default=None)
    invite_token=db.Column(db.String(64),default=generate_invite_token)
    def room(self):
        return Room.query.filter_by(id=self.room_id).first()
    @staticmethod
    def find_by_token(userToken):
        try:
            data = decode_token(userToken)
        except:
            pass

    def data_auth_token(self):
        return generate_token(self.invite_token+":::"+str(self.id)+":::"+str(self.room_id))
    @staticmethod
    def join_room(user_token,ip_addess):
        validate_not_expired(user_token)
        try:
            inv_tok,u_id,r_id,issued = decode_token(user_token)
        except:
            return False
        RoomUser


class AdminUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(40))
    realname = db.Column(db.String(100))
    email = db.Column(db.String(100),unique=True)
    _password = db.Column(db.String(64))
    _ident = db.Column(db.String(64),nullable=True,default=None)
    is_active = db.Column(db.Boolean,default=True)
    is_anonymous = db.Column(db.Boolean,default=False)

    is_authenticated=True
    is_admin = True
    @staticmethod
    def login(username,password):
        user = AdminUser.query.filter_by(email=username).first()
        if not user:
            print("NO USER FOUND?",username,AdminUser.query.all())
            return False
        if not user.check_password(password):
            print("PW MISMATCH!")
            return False
        return user
    @staticmethod
    def hash_password(s):
        return sha256(s)
    def check_password(self,password):
        return self.hash_password(password) == self._password
    @property
    def password(self):
        return "<nope@that wont work>"

    @staticmethod
    @login_manager.user_loader
    def get_user(id):
        return AdminUser.query.filter_by(_ident=id).first()
    def get_id(self):
        return self._ident
    def set_password(self,value):
        self._password = self.hash_password(value)
    def __init__(self,**kwargs):
        password = kwargs.pop('password','')
        db.Model.__init__(self,**kwargs)
        if password:
            self.set_password(password)
        self._ident = sha256(self.email+":admin:")


class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner_id =db.Column(db.Integer)
    created =db.Column(db.DateTime,default=datetime.datetime.now)
    is_active = db.Column(db.Boolean,default=True)
    def owner(self):
        return AdminUser.query.filter_by(id=self.owner_id).first()
    def owner_name(self):
        owner = self.owner()
        return owner.realname or owner.nickname or owner.email
    def active_users_count(self):
        return RoomUser.query.filter(RoomUser.state.endswith("active")).count();
    def all_users_count(self):
        return RoomUser.query.filter_by(room_id=self.id).count();
    room_name = db.Column(db.String(40))
    is_public = db.Column(db.Boolean,default=False)
    is_guest = False


def create_all(admin_email,admin_password,uri='sqlite:///./tmp_test.db',):
    a = flask.Flask(__name__)
    Xdb = init_app(a,uri)
    Xdb.create_all()
    Xdb.session.add(AdminUser(email=admin_email,password=admin_password,nickname=admin_email.split("@",1)[0],realname=""))
    Xdb.session.commit()
    print("OK SETUP!")

if __name__ == "__main__":
    create_all("joran@decagon.com","1234")