from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User

router = APIRouter(prefix="/users", tags=["Users"])


# ✅ REGISTER USER
@router.post("/register")
def register(data: dict, db: Session = Depends(get_db)):
    try:
        print("REGISTER DATA:", data)

        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        # 🔥 VALIDATION
        if not name or not email or not password:
            return {"detail": "All fields are required"}

        # 🔥 CHECK EXISTING USER
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return {"detail": "User already exists"}

        # ✅ CREATE USER (NO HASH - SIMPLE)
        new_user = User(
            name=name,
            email=email,
            password=password
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print("✅ USER CREATED:", new_user.email)

        return {"message": "User registered successfully"}

    except Exception as e:
        print("❌ REGISTER ERROR:", e)
        return {"detail": str(e)}


# ✅ LOGIN USER
@router.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    try:
        print("LOGIN DATA:", data)

        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        # 🔥 VALIDATION
        if not email or not password:
            return {"detail": "Email and password required"}

        # 🔍 FIND USER
        user = db.query(User).filter(User.email == email).first()

        if not user:
            return {"detail": "User not found"}

        print("DB PASSWORD:", user.password)
        print("INPUT PASSWORD:", password)

        # 🔥 PASSWORD CHECK
        if user.password != password:
            return {"detail": "Invalid password"}

        print("✅ LOGIN SUCCESS:", user.name)

        # ✅ RETURN USER OBJECT (IMPORTANT FOR FRONTEND)
        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }

    except Exception as e:
        print("❌ LOGIN ERROR:", e)
        return {"detail": str(e)}