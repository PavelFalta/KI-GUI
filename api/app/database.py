from typing import Any
from sqlalchemy import Engine, create_engine

from collections.abc import Generator


from sqlalchemy.orm import sessionmaker

from sqlalchemy.ext.declarative import declarative_base


from sqlalchemy.orm.session import Session
from app.config import settings


# SQLite specific settings 
connect_args: dict[str, bool] = {"check_same_thread": False}


engine: Engine = create_engine(settings.sql.get_url(), connect_args=connect_args)

Base = declarative_base()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency
def get_sql() -> Generator[Session, Any, None]:
    session: Session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
