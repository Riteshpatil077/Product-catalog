from typing import Generator, List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database import SessionLocal, engine
from backend.database_models import Product as DBProduct
from backend.models import Product
import backend.database_models as database_models

app = FastAPI(title="Product Catalog")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database_models.Base.metadata.create_all(bind=engine)

@app.get("/", response_model=dict)
def read_root() -> dict:
    return {"message": "Welcome to FastAPI!"}

products: List[Product] = [
    Product(id=1, name="Phone", description="budget phone", price=99, quantity=10),
    Product(id=2, name="Tablet", description="budget tablet", price=99, quantity=10),
    Product(id=3, name="Laptop", description="budget laptop", price=99, quantity=10),
]


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    db = SessionLocal()
    try:
        count = db.query(database_models.Product).count()
        if count == 0:
            for product in products:
                db.add(DBProduct(**product.model_dump()))
            db.commit()
    finally:
        db.close()


init_db()


@app.get("/products", response_model=List[Product])
def get_all_products(db: Session = Depends(get_db)) -> List[Product]:
    return db.query(DBProduct).all()


@app.get("/products/{id}", response_model=Product)
def get_product(id: int, db: Session = Depends(get_db)) -> Product:
    db_product = db.query(DBProduct).filter(DBProduct.id == id).first()
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return db_product


@app.post("/products", response_model=Product, status_code=status.HTTP_201_CREATED)
def add_product(product: Product, db: Session = Depends(get_db)) -> Product:
    db_product = DBProduct(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@app.put("/products/{id}", response_model=Product)
def update_product(id: int, updated_product: Product, db: Session = Depends(get_db)) -> Product:
    db_product = db.query(DBProduct).filter(DBProduct.id == id).first()
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    db_product.name = updated_product.name
    db_product.description = updated_product.description
    db_product.price = updated_product.price
    db_product.quantity = updated_product.quantity
    db.commit()
    db.refresh(db_product)
    return db_product


@app.delete("/products/{id}", response_model=dict)
def delete_product(id: int, db: Session = Depends(get_db)) -> dict:
    db_product = db.query(DBProduct).filter(DBProduct.id == id).first()
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}
            