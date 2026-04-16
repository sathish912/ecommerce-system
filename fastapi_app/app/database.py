from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "mysql+pymysql://root:mysql%402026@127.0.0.1/ecommerce_db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# 🔥 ✅ THIS IS THE MISSING FUNCTION
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()