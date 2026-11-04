from sqlalchemy.orm import Session
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
    product = db.query(models.Product).filter(models.Product.id == item.product_id).first()

    if product is None:
        raise ValueError(f"Product {item.product_id} not found")
    
    db_item = models.Order_items(
        product_id = item.product_id,
        order_id = item.order_id,
        purchased_price = product.current_price,
        quantity = item.quantity
    )

    db.add(db_item)

    order = db.query(models.Order).filter(models.Order.id == item.order_id).first()
    if order is None:
        raise ValueError(f"Order {item.order_id} not found")

    order.total_price+=db_item.purchased_price*db_item.quantity

    db.commit()
    db.refresh(db_item)

    return db_item



def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_user_orders(db: Session, user_id: int):
    return db.query(models.Order).filter(models.Order.user_id == user_id).all()