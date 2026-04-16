from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


# ==============================
# 👤 USER MODEL
# ==============================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))

    # 🔗 RELATIONSHIPS
    cart_items = relationship("Cart", back_populates="user")
    orders = relationship("Order", back_populates="user")


# ==============================
# 📦 PRODUCT MODEL
# ==============================
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    description = Column(String(255))
    price = Column(Float)
    stock = Column(Integer)
    image = Column(String(255))

    # 🔥 REQUIRED FOR FILTERS
    category = Column(String(100))
    brand = Column(String(100))
    color = Column(String(50))

    # 🔗 RELATIONSHIPS
    cart_items = relationship("Cart", back_populates="product")


# ==============================
# 🛒 CART MODEL
# ==============================
class Cart(Base):
    __tablename__ = "cart"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)

    # 🔗 RELATIONSHIPS
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")


# ==============================
# 🧾 ORDER MODEL
# ==============================
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    total = Column(Float)
    status = Column(String(50))
    payment_id = Column(String(255))

    # 📍 ADDRESS
    address = Column(String(255))
    pincode = Column(String(20))

    # 🔗 RELATIONSHIPS
    user = relationship("User", back_populates="orders")