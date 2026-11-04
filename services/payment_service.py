import requests
import os
from sqlalchemy.orm import Session
from models import models
from fastapi import HTTPException

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_SECRET_KEY = os.getenv("PAYPAL_SECRET_KEY")
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"

def get_paypal_access_token():
    if PAYPAL_CLIENT_ID is None or PAYPAL_SECRET_KEY is None:
        raise HTTPException(status_code=500, detail="PayPal credentials are not configured")

    url = f"{PAYPAL_API_BASE}/v1/oauth2/token"
    headers = {
        "Accept": "application/json",
        "Accept-Language": "en_US"
    }
    data = {"grant_type": "client_credentials"}

    response = requests.post(
        url,
        auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET_KEY),
        headers=headers,
        data=data
    )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to authenticate with PayPal")

    return response.json()["access_token"]

def create_checkout_session(db: Session, order_id: int):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    access_token = get_paypal_access_token()

    url = f"{PAYPAL_API_BASE}/v2/checkout/orders"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    total_amount = str(order.total_price)

    payload = {
        "intent" : "CAPTURE",
        "purchase_units": [
            {
                "reference_id" : str(order.id),
                "amount": {
                    "currency_code": "USD",
                    "value": total_amount
                }
            }
        ],
        "application_context": {
            "return_url": f"http://localhost:8000/payments/success?order_id={order.id}",
            "cancel_url": f"http://localhost:8000/payments/cancel"
        }
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="Failed to create PayPal order")

    paypal_data = response.json()

    checkout_url = next(link["href"] for link in paypal_data["links"] if link["rel"] == "approve")

    return {"checkout_url": checkout_url}