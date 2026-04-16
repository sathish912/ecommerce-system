import hashlib
import os
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "secret123"
ALGORITHM = "HS256"


def hash_password(password: str):
    salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode(),
        salt,
        100000
    )
    return salt.hex() + ":" + hashed.hex()


def verify_password(plain_password: str, stored_password: str):
    salt, hashed = stored_password.split(":")
    new_hash = hashlib.pbkdf2_hmac(
        'sha256',
        plain_password.encode(),
        bytes.fromhex(salt),
        100000
    )
    return new_hash.hex() == hashed


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=10)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)