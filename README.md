# Order Management & E-Commerce API

A robust, production-ready backend service for managing e-commerce operations, built with Python and FastAPI. This project implements a clean layered architecture (Controller-Service-Schema) to separate business logic from HTTP routing, ensuring high maintainability and scalability.

## 🚀 Key Features

*   **Clean Architecture:** Strict separation of concerns using routing controllers, business logic services, and Pydantic schemas.
*   **Secure Authentication:** Stateless session management using short-lived JSON Web Tokens (JWT) and Bcrypt password hashing.
*   **Order & Cart Management:** Dynamic cart total calculations and transactional database updates.
*   **Payment Gateway Integration:** End-to-end checkout flow using the official PayPal REST API, including automated success and cancellation webhooks.
*   **Data Validation:** Strict input validation and serialization using Pydantic.

## 🛠️ Tech Stack

*   **Framework:** FastAPI
*   **Language:** Python 3.10+
*   **Database:** PostgreSQL (via SQLAlchemy ORM)
*   **Authentication:** PyJWT, Passlib (Bcrypt)
*   **Payments:** PayPal Checkout API

## ⚙️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ElHefnawy1290/Order_management_service.git](https://github.com/ElHefnawy1290/Order_management_service.git)
   cd Order_management_service
   ```

2. **Create a virtual environment and install dependencies:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   DATABASE_URL=postgresql://user:password@localhost/dbname
   JWT_SECRET_KEY=your_secure_random_hex_string
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_SECRET=your_paypal_secret
   ```

4. **Run the Application:**
   ```bash
   uvicorn main:app --reload
   ```

5. **View API Documentation:**
   Open your browser and navigate to `http://127.0.0.1:8000/docs` to interact with the Swagger UI.
