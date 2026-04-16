from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import models
from app.schemas import ProductCreate
from app.database import get_db

router = APIRouter(prefix="/products", tags=["Products"])


# ==============================
# ➕ CREATE PRODUCT
# ==============================
@router.post("/")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    try:
        new_product = models.Product(
            name=product.name,
            description=product.description,
            price=product.price,
            stock=product.stock,
            image=product.image,
            category=product.category or "general",
            brand=product.brand or "unknown",
            color=product.color or "unknown"
        )

        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return {
            "message": "Product created ✅",
            "product": new_product
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================
# 📦 GET ALL PRODUCTS (FILTER + SEARCH)
# ==============================
@router.get("/")
def get_products(
    category: str = Query(None),
    brand: str = Query(None),
    color: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)

    # 🔍 FILTERS
    if category:
        query = query.filter(models.Product.category.ilike(f"%{category}%"))

    if brand:
        query = query.filter(models.Product.brand.ilike(f"%{brand}%"))

    if color:
        query = query.filter(models.Product.color.ilike(f"%{color}%"))

    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))

    products = query.all()

    # 🔥 SAFE RESPONSE (NO NULL BREAK UI)
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "stock": p.stock,
            "image": p.image,
            "category": p.category or "general",
            "brand": p.brand or "unknown",
            "color": p.color or "unknown"
        })

    return result


# ==============================
# 🔍 GET SINGLE PRODUCT
# ==============================
@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "stock": product.stock,
        "image": product.image,
        "category": product.category or "general",
        "brand": product.brand or "unknown",
        "color": product.color or "unknown"
    }


# ==============================
# ❌ DELETE PRODUCT
# ==============================
@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()

    return {"message": "Product deleted 🗑️"}