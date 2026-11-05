from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import models
from services import payment_service

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/checkout/{order_id}")
def initiate_checkout(order_id: int, db: Session = Depends(get_db)):
    return payment_service.create_checkout_session(db=db, order_id=order_id)

@router.get("/success")
def payment_success(order_id: int, token: Optional[str] = None, PayerID: Optional[str] = None, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Order not found"
        )
        
    setattr(order, "status", "successful")
    db.commit()
    
    return {
        "message": "Payment successful", 
        "order_id": order.id, 
        "status": order.status
    }

@router.get("/cancel")
def payment_cancelled(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    if order:
        setattr(order, "status", "canceled")
        db.commit()
        
    return {
        "message": "Payment transaction was canceled by the user",
        "order_id": order_id,
        "status": "canceled"
    }