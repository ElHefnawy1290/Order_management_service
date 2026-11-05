from fastapi import APIRouter, Depends, HTTPException, status
from schemas import Product as product_schema
from services import product_service
from database import get_db
from sqlalchemy.orm import Session
from typing import List

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[product_schema.ProductResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return product_service.get_products(
        db=db,
        skip=skip,
        limit=limit
    )

@router.get("/{product_id}", response_model=product_schema.ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = product_service.get_product(db=db, product_id=product_id)

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    return product

@router.post("/", response_model=product_schema.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: product_schema.ProductCreate, db: Session = Depends(get_db)):
    return product_service.CreateProduct(db=db, product=product)
