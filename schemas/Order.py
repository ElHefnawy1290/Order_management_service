from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

class OrderBase(BaseModel):
    user_id : int
    status: str = "pending"

class OrderCreate(OrderBase):
    pass

class OrderStatusUpdate(BaseModel):
    status: str

class OrderResponse(OrderBase):
    id : int
    total_price : Decimal
    timestamp: datetime

    class Config:
        from_attributes = True