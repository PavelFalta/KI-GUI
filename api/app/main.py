from fastapi import FastAPI
from app import models
from app.database import engine
from sqlalchemy_schemadisplay import create_schema_graph
from fastapi.middleware.cors import CORSMiddleware

from app.src.routers import router as api_router
from app.src.auth.routes import router as auth_router

# Create the database tables
models.Base.metadata.create_all(bind=engine)
graph = create_schema_graph(
    metadata=models.Base.metadata,
    engine=engine,
    show_datatypes=True,
    show_indexes=True,
    rankdir="LR",
    font="Helvetica",
)
graph.write_png("db_schema.png")


app = FastAPI(docs_url="/", redoc_url=None)

origins: list[str] = ["*"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router)
app.include_router(auth_router)
