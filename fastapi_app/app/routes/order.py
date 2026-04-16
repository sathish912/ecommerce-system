from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Order, Cart, Product
import razorpay

router = APIRouter(prefix="/orders", tags=["Orders"])

# 🔐 Razorpay Keys (use env in production)
client = razorpay.Client(auth=(
    "rzp_test_SblFaP6yiTzSNo",
    "dYthpT2U1PhSGLOCTAVm2iOS"
))


# ==============================
# 💳 CREATE PAYMENT ORDER
# ==============================
@router.post("/create-payment/{user_id}")
def create_payment(user_id: int, db: Session = Depends(get_db)):
    cart_items = db.query(Cart).filter(Cart.user_id == user_id).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0

    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue
        total += product.price * item.quantity

    if total == 0:
        raise HTTPException(status_code=400, detail="Invalid cart total")

    try:
        payment = client.order.create({
            "amount": int(total * 100),  # paisa
            "currency": "INR",
            "payment_capture": 1
        })

        return {
            "order_id": payment["id"],
            "amount": total,
            "currency": "INR"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================
# ✅ VERIFY PAYMENT & SAVE ORDER
# ==============================
@router.post("/verify-payment/{user_id}")
def verify_payment(user_id: int, data: dict, db: Session = Depends(get_db)):

    try:
        # 🔐 Verify signature
        client.utility.verify_payment_signature({
            "razorpay_order_id": data.get("razorpay_order_id"),
            "razorpay_payment_id": data.get("razorpay_payment_id"),
            "razorpay_signature": data.get("razorpay_signature"),
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    cart_items = db.query(Cart).filter(Cart.user_id == user_id).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0

    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            total += product.price * item.quantity

    # 🧾 SAVE ORDER
    new_order = Order(
        user_id=user_id,
        total=total,
        status="paid",
        payment_id=data.get("razorpay_payment_id"),
        address=data.get("address"),
        pincode=data.get("pincode")
    )

    db.add(new_order)

    # 🧹 CLEAR CART
    for item in cart_items:
        db.delete(item)

    db.commit()

    return {
        "message": "Payment successful & order placed 🎉",
        "order_id": new_order.id
    }


# ==============================
# 📦 GET USER ORDERS
# ==============================
@router.get("/{user_id}")
def get_orders(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).all()

    return [
        {
            "id": o.id,
            "total": o.total,
            "status": o.status,
            "payment_id": o.payment_id,
            "address": o.address,
            "pincode": o.pincode
        }
        for o in orders
    ]