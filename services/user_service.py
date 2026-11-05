from sqlalchemy.orm import Session
from passlib.context import CryptContext
from models import models
from schemas import User as user_schema
import os
import jwt
from datetime import datetime, timedelta, timezone

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_user(db: Session, user: user_schema.UserCreate):

    hashed_password = pwd_context.hash(user.password)

    db_user = models.User(
        username = user.username,
        password_hash = hashed_password,
        role = user.role
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def authenticate(db: Session, username: str, password: str):
    user =  db.query(models.User).filter(models.User.username == username).first()

    if not user:
        return None

    if not pwd_context.verify(password, user.password_hash):
        return None

    return user