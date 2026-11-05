from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas import Order as order_schema
from schemas import Order_items as order_items_schema
from services import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("/{order_id}", response_model=order_schema.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = order_service.get_order(db=db, order_id=order_id)

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return order

@router.post("/", response_model=order_schema.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: order_schema.OrderCreate, db: Session = Depends(get_db)):
    return order_service.create_order(db=db, order=order)

@router.post("/items", response_model=order_items_schema.OrderItemsResponse)
def add_item_to_order(item: order_items_schema.OrderItemsCreate, db: Session = Depends(get_db)):
    return order_service.add_item_to_order(db=db, item=item)