import base64
import hashlib
import random
import time

class ExpiredTokenException(Exception):
    pass
def ensure_bytes(s,encoding='latin1'):
    if isinstance(s,bytes):
        return s
    return "{0}".format(s).encode(encoding)
def sha256(s):
    return hashlib.sha256(ensure_bytes(s)).hexdigest()
def b64enc(s):
    return base64.b64encode(ensure_bytes(s)).decode('latin1')

def generate_invite_token(salt=None):
    salt=salt or (str(time.time())+str(random.random()))
    return sha256(generate_token(salt=salt))

def is_expired(token,expired_after=10):
    return (time.time()-decode_token(token)[-1])>expired_after

def validate_not_expired(token,expired_after=10):
    if is_expired(token,expired_after):
        raise ExpiredTokenException

def generate_token(data=None,salt="!+@#",sep=":::"):
    data = data+salt if data else str(time.time())+str(random.randint())+salt
    token = sha256(data)
    issued = str(int(time.time()))
    return b64enc(token+sep+issued)

def decode_token(token,sep=":::"):
    return base64.b64decode(token).split(sep)