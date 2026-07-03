from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.models import Product
from backend.database import session, engine
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
@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!"}

products = [
    Product(id=1, name="Phone", description="budget phone", price=99, quantity=10),
    Product(id=2, name="Tablet", description="budget tablet", price=99, quantity=10),
    Product(id=3, name="Laptop", description="budget laptop", price=99, quantity=10)
]

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()

def init_db():
    db =session()
    count = 0
    count = db.query(database_models.Product).count()
    if count == 0:
        for product in products:
            db.add(database_models.Product(**product.model_dump()))
        db.commit()
        db.close()

init_db()


@app.get("/products")
def get_all_products(db: Session = Depends(get_db)):
    db_products = db.query(database_models.Product).all()
    return db_products

@app.get("/products/{id}")
def get_product(id:int,db: Session = Depends(get_db)):
    # return products[id-1]
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product:
        return db_product

    return ({"error": "Product not found"}, 404)    

@app.post("/products")
def add_product(product:Product, db: Session = Depends(get_db)):
    db.add(database_models.Product(**product.model_dump()))
    db.commit()
    return product 


@app.put("/products/{id}")
def update_product(id:int, updated_product:Product, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product:
        db_product.name = updated_product.name
        db_product.description = updated_product.description
        db_product.price = updated_product.price
        db_product.quantity = updated_product.quantity
        db.commit()
        db.close()
        return db_product
    else:    
        return ({"error": "Product not found"}, 404)    
   

@app.delete("/products/{id}")
def delete_product(id:int, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        db.close()
        return {"message": "Product deleted successfully"}
    else:
        return ({"error": "Product not found"}, 404)
            