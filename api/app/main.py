from fastapi import FastAPI
from app import models
from app.database import engine
from sqlalchemy_schemadisplay import create_schema_graph

from app.src.routers import router as api_router

# Create the database tables
models.Base.metadata.create_all(bind=engine)
graph = create_schema_graph(metadata=models.Base.metadata, engine=engine, show_datatypes=True, show_indexes=True, rankdir="LR", font="Helvetica")
graph.write_png("db_schema.png")
app = FastAPI(docs_url="/")


app.include_router(api_router)
