from sqlalchemy.orm import Session
from typing import cast
from models import models
from schemas import Order as order_schema, Order_items as order_items_schema

def create_order(db: Session, order: order_schema.OrderCreate):
    db_order = models.Order(
        user_id = order.user_id,
        status = order.status,
        total_price = 0
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return db_order

def add_item_to_order(db: Session, item: order_items_schema.OrderItemsCreate):
    if item.quantity < 1:
        raise ValueError("Quantity must be at least 1")

    product = db.query(models.Product).filter(models.Product.id == item.product_id).first()

    if product is None:
        raise ValueError(f"Product {item.product_id} not found")
    
    order = db.query(models.Order).filter(models.Order.id == item.order_id).first()
    if order is None:
        raise ValueError(f"Order {item.order_id} not found")
    if cast(str, order.status) != "pending":
        raise ValueError("Only pending orders can be changed")
    if cast(int, product.stock_quantity) < item.quantity:
        raise ValueError(f"Only {product.stock_quantity} item(s) are in stock")

    db_item = models.Order_items(
        product_id = item.product_id,
        order_id = item.order_id,
        purchased_price = product.current_price,
        quantity = item.quantity
    )

    db.add(db_item)
    setattr(product, "stock_quantity", cast(int, product.stock_quantity) - item.quantity)
    order.total_price+=db_item.purchased_price*db_item.quantity

    db.commit()
    db.refresh(db_item)

    return db_item



def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_user_orders(db: Session, user_id: int):
    return db.query(models.Order).filter(models.Order.user_id == user_id).all()

def get_orders(db: Session):
    return db.query(models.Order).order_by(models.Order.timestamp.desc()).all()

def update_order_status(db: Session, order_id: int, new_status: str):
    if new_status == "canceled":
        return cancel_order(db, order_id)
    order = get_order(db, order_id)
    if order is None:
        raise ValueError("Order not found")
    if new_status not in {"pending", "completed", "canceled"}:
        raise ValueError("Invalid order status")
    if cast(str, order.status) == "canceled" and new_status != "canceled":
        raise ValueError("Canceled orders cannot be reopened")
    if cast(str, order.status) == "completed" and new_status != "completed":
        raise ValueError("Completed orders cannot be changed")
    setattr(order, "status", new_status)
    db.commit()
    db.refresh(order)
    return order

def cancel_order(db: Session, order_id: int):
    order = get_order(db, order_id)
    if order is None:
        raise ValueError("Order not found")
    if cast(str, order.status) != "pending":
        raise ValueError("Only pending orders can be canceled")
    items = db.query(models.Order_items).filter(models.Order_items.order_id == order_id).all()
    for item in items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            setattr(product, "stock_quantity", cast(int, product.stock_quantity) + item.quantity)
    setattr(order, "status", "canceled")
    db.commit()
    db.refresh(order)
    return order