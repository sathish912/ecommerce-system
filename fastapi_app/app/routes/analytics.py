from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
from ..utils.dependencies import get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# =========================
# 📊 DASHBOARD ANALYTICS
# =========================
@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):

    # ✅ Total orders
    total_orders = db.query(models.Order).count()

    # ✅ Total revenue (only paid orders)
    total_revenue = db.query(func.sum(models.Order.total)) \
        .filter(models.Order.status == "paid").scalar() or 0

    # ✅ Paid orders
    paid_orders = db.query(models.Order) \
        .filter(models.Order.status == "paid").count()

    # ✅ Pending orders
    pending_orders = db.query(models.Order) \
        .filter(models.Order.status == "pending").count()

    # ✅ Shipped orders
    shipped_orders = db.query(models.Order) \
        .filter(models.Order.status == "shipped").count()

    # ✅ Delivered orders
    delivered_orders = db.query(models.Order) \
        .filter(models.Order.status == "delivered").count()

    # 🔥 Top products (based on cart usage)
    top_products = db.query(
        models.Product.name,
        func.count(models.Cart.product_id).label("count")
    ).join(models.Cart, models.Product.id == models.Cart.product_id) \
     .group_by(models.Product.name) \
     .order_by(func.count(models.Cart.product_id).desc()) \
     .limit(5).all()

    # 🔄 Convert to clean JSON
    top_products_list = [
        {"name": name, "count": count}
        for name, count in top_products
    ]

    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "paid_orders": paid_orders,
        "pending_orders": pending_orders,
        "shipped_orders": shipped_orders,
        "delivered_orders": delivered_orders,
        "top_products": top_products_list
    }