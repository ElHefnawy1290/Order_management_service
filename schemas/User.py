from pydantic import BaseModel
from datetime import datetime

class UserBase(BaseModel):
    username : str

class UserCreate(UserBase):
    password : str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = None

class UserLogin(BaseModel):
    username: str
    password: str
