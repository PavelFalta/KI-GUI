from app import models
from app.src.users.schemas import UserCreate, UserResponse
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, OperationalError


def create_user(sql: Session, data: UserCreate) -> UserResponse:
    try:
        new_user: models.User = models.User(**data.model_dump())
        sql.add(new_user)
        sql.commit()
        sql.refresh(new_user)

        return UserResponse.model_validate(new_user)

    except IntegrityError as e:
        sql.rollback()
        print(e.__dict__)
        print(e.orig)
        print(type(e))
        raise HTTPException(status_code=409, detail=str(e.orig)) from e

    # except OperationalError as e:
    #     # print(e)
    #     sql.rollback()
    #     raise HTTPException(status_code=500, detail="asd") from e
