from pydantic import BaseModel
from datetime import datetime

class UserBase(BaseModel):
    username : str
    role : str = "staff"

class UserCreate(UserBase):
    pass
    password : str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class config:
        from_attributes = True
