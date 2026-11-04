from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

class OrderBase(BaseModel):
    user_id : int
    status: str = "pending"

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id : int
    total_price : Decimal
    timestamp: datetime

    class config:
        from_attributes = True