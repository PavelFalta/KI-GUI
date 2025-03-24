from typing import Any
from app import models
from sqlalchemy import Engine, create_engine

from collections.abc import Generator


from sqlalchemy.orm import sessionmaker

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.exc import IntegrityError


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


def init_db() -> None:
    models.Base.metadata.create_all(bind=engine)

    session: Session = SessionLocal()
    try:
        # Check if admin role already exists
        admin_exists = (
            session.query(models.Role).filter_by(name="admin").first() is not None
        )

        if not admin_exists:
            # Add roles
            session.add(models.Role(name="admin", description="Administrator"))
            session.add(models.Role(name="teacher", description="Teacher"))
            session.add(models.Role(name="student", description="Student"))

            # Add root user
            session.add(
                models.User(
                    username="root",
                    first_name="Root",
                    last_name="Root",
                    password_hash="root",
                    email="root@root.root",
                    role_id=1,
                )
            )
            session.commit()
            print("Database initialized with default data")
        else:
            print("Database already contains data, skipping initialization")

    except IntegrityError as e:
        print(f"Error initializing database: {e}")

    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        session.close()
