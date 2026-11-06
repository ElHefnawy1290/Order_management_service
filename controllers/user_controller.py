from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import models
from schemas import User as user_schema
from services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/signup", response_model=user_schema.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: user_schema.UserCreate, db: Session = Depends(get_db)):
    if user_service.get_user_by_username(db, user_data.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    return user_service.create_user(db=db, user=user_data)


@router.post("/login")
def login(login_credentials: user_schema.UserLogin, db: Session = Depends(get_db)):
    user = user_service.authenticate(db, login_credentials.username, login_credentials.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    access_token = user_service.create_access_token(
        data={"sub": user.username, "id": user.id, "role": user.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username, "role": user.role},
    }


@router.get("/", response_model=list[user_schema.UserResponse])
def read_users(db: Session = Depends(get_db)):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.get("/{user_id}", response_model=user_schema.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=user_schema.UserResponse)
def update_user(user_id: int, updates: user_schema.UserUpdate, db: Session = Depends(get_db)):
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    try:
        return user_service.update_user(db, user, updates)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
