from pydantic import BaseModel
from decimal import Decimal

class OrderItems(BaseModel):
    order_id: int
    product_id: int
    quantity: int = 1

class OrderItemsCreate(OrderItems):
    pass

class OrderItemsResponse(OrderItems):
    id: int
    purchased_price: Decimal

    class Config:
        from_attributes = True