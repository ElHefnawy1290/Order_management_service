from sqlalchemy.orm import Session
from passlib.context import CryptContext
from models import models
from schemas import User as user_schema

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

