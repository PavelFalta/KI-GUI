from fastapi import FastAPI, Depends
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from typing import Annotated
from sqlalchemy.ext.declarative import declarative_base

app = FastAPI(docs_url="/")


@app.get("/a")
def read_root() -> dict[str, str]:
    return {"message": "Hello, World!"}


class Settings(BaseSettings):
    app_name: str = "Awesome API"
    admin_email: str
    items_per_user: int = 50
    sqlite_name: str
    model_config = SettingsConfigDict(env_file=".env", env_prefix="__")

    def get_url(self):
        return f"sqlite:///{self.sqlite_name}"


settings = Settings(_env_file=".env", _env_file_encoding="utf-8")
connect_args = {"check_same_thread": False}
sqlite_name = settings.get_url()
engine = create_engine(sqlite_name, connect_args=connect_args, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]


@app.get("/info")
def info(session: SessionDep):
    return {
        "app_name": settings.app_name,
        "admin_email": settings.admin_email,
        "items_per_user": settings.items_per_user,
        "sqlite_name": settings.get_url(),
        "engine": session,
    }
