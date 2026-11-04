from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = ""
    current_price : Decimal
    stock_quantity : int = 0

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int

    class config:
        from_attributes = True