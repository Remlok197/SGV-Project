from fastapi import FastAPI
from .database import engine, Base
from . import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Taquería Delgado", version="1.0")

@app.get("/")
def read_root():
    return {"mensaje": "Revivan el server"}