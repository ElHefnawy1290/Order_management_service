from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import models
from controllers import user_controller, product_controller, order_controller, payment_controller

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Order Management API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):51[0-9]{2}",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_controller.router)
app.include_router(product_controller.router)
app.include_router(payment_controller.router)
app.include_router(order_controller.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Order Management Service"}