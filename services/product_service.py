from sqlalchemy.orm import Session
from models import models
from schemas import Product as product_schema

def CreateProdcut(db: Session, product: product_schema.ProductCreate):
    db_product = models.Product(
        name = product.name,
        description = product.description,
        current_price = product.current_price,
        stock_quantity = product.stock_quantity
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return db_product

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()