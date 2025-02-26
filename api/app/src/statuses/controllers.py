from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models
from app.src.statuses.schemas import StatusCreate, StatusResponse

from sqlalchemy.exc import IntegrityError


def get_statuses(sql: Session) -> list[StatusResponse]:
    return [
        StatusResponse.model_validate(status)
        for status in sql.query(models.Status).all()
    ]


def create_status(sql: Session, data: StatusCreate) -> StatusResponse:
    try:
        new_status = models.Status(**data.model_dump())
        sql.add(new_status)
        sql.commit()
        sql.refresh(new_status)
        print(new_status.__dict__)
        return StatusResponse.model_validate(new_status)

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Status already exists") from e
