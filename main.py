from fastapi import FastAPI
from database import engine
from models import models
from controllers import user_controller, product_controller, order_controller, payment_controller

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Order Management API")

app.include_router(user_controller.router)
app.include_router(product_controller.router)
app.include_router(payment_controller.router)
app.include_router(order_controller.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Order Management Service"}