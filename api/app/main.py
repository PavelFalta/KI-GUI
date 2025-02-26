from fastapi import FastAPI
from app import models
from app.database import engine

from app.src.routers import router as api_router

# Create the database tables
models.Base.metadata.create_all(bind=engine)


app = FastAPI(docs_url="/")


app.include_router(api_router)
