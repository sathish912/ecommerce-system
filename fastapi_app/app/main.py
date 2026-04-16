from fastapi import FastAPI
from .database import Base, engine
from .routes import user, product
from .routes.cart import router as cart_router
from .routes.order import router as order_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

Base.metadata.create_all(bind=engine)

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ ROUTES
app.include_router(user.router)
app.include_router(product.router)
app.include_router(cart_router)
app.include_router(order_router)

# 🔥 IMPORTANT FIX: STATIC IMAGES
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app.mount(
    "/images",
    StaticFiles(directory=os.path.join(BASE_DIR, "..", "images")),
    name="images"
)

# ✅ ROOT
@app.get("/")
def root():
    return {"message": "Ecommerce API running"}