from pydantic import BaseModel


# =========================
# 👤 USER
# =========================
class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


# =========================
# 🛍️ PRODUCT
# =========================
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    image: str
    category: str
    brand: str
    color: str


class ProductResponse(ProductCreate):
    id: int

    class Config:
        from_attributes = True


# =========================
# 🛒 CART
# =========================
class CartCreate(BaseModel):
    user_id: int
    product_id: int
    quantity: int


# =========================
# 📦 ORDER
# =========================
class OrderCreate(BaseModel):
    user_id: int


# =========================
# 💳 PAYMENT
# =========================
class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str