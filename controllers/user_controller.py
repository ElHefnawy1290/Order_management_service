from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas import User as user_schema
from services import user_service
from database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/signup", response_model=user_schema.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: user_schema.UserCreate, db: Session = Depends(get_db)):

    existing_user = user_service.get_user_by_username(db, username=user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    return user_service.create_user(db=db, user=user_data)

@router.post("/login")
def login(login_credentials: user_schema.UserLogin, db: Session = Depends(get_db)):

    user = user_service.authenticate(
        db,
        username=login_credentials.username,
        password=login_credentials.password
    )

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=("Invalid username or password"))

    access_token = user_service.create_access_token(
        data={"sub": user.username, "id": user.id, "role": user.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }