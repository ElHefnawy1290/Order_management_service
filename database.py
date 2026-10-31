from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50),unique=True ,nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="staff")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    current_price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, default=0)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(20), default='pending')
    total_price = Column(Numeric(10, 2), default=0)
    user_id = Column(Integer, ForeignKey("users.id"),nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class Order_items(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    purchased_price = Column(Numeric(10, 2), nullable=False)