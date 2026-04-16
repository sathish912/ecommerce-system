from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Cart, Product

router = APIRouter(prefix="/cart", tags=["Cart"])


# ✅ ADD TO CART (FINAL FIXED)
@router.post("/add")
def add_to_cart(data: dict, db: Session = Depends(get_db)):
    try:
        print("DATA RECEIVED:", data)

        new_item = Cart(
            user_id=int(data["user_id"]),
            product_id=int(data["product_id"]),
            quantity=int(data["quantity"])
        )

        db.add(new_item)
        db.commit()

        print("✅ INSERT SUCCESS")

        return {"message": "Added"}

    except Exception as e:
        print("❌ ERROR:", e)
        return {"error": str(e)}


# ✅ GET CART (WITH PRODUCT DETAILS)
@router.get("/{user_id}")
def get_cart(user_id: int, db: Session = Depends(get_db)):
    cart_items = db.query(Cart).filter(Cart.user_id == user_id).all()

    result = []

    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()

        if product:
            result.append({
                "id": item.id,
                "quantity": item.quantity,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "image": product.image,
                    "description": product.description
                }
            })

    print("CART DATA:", result)

    return result


# ✅ REMOVE ITEM
@router.delete("/{cart_id}")
def remove_item(cart_id: int, db: Session = Depends(get_db)):
    item = db.query(Cart).filter(Cart.id == cart_id).first()

    if not item:
        return {"error": "Item not found"}

    db.delete(item)
    db.commit()

    return {"message": "Item removed ✅"}

@router.put("/update/{cart_id}")
def update_quantity(cart_id: int, action: str, db: Session = Depends(get_db)):
    item = db.query(Cart).filter(Cart.id == cart_id).first()

    if not item:
        return {"error": "Item not found"}

    if action == "inc":
        item.quantity += 1
    elif action == "dec":
        item.quantity -= 1
        if item.quantity <= 0:
            db.delete(item)
            db.commit()
            return {"message": "Item removed"}

    db.commit()

    return {"message": "Updated"}