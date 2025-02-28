from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models
from app.src.statuses.schemas import StatusCreate, StatusResponse, StatusUpdate

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

        return StatusResponse.model_validate(new_status)

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Status already exists") from e


def update_status(sql: Session, data: StatusUpdate, status_id: int) -> StatusResponse:
    try:
        status: models.Status = (
            sql.query(models.Status).filter(models.Status.id == status_id).first()
        )
        if not status:
            raise HTTPException(status_code=404, detail="Status not found")
        for var, value in vars(data).items():
            if value is not None:
                setattr(status, var, value)
        sql.commit()
        sql.refresh(status)
        return StatusResponse.model_validate(status)
    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Status already exists") from e


def get_status(sql: Session, status_id: int) -> StatusResponse:
    status = sql.query(models.Status).filter(models.Status.id == status_id).first()
    if not status:
        raise HTTPException(status_code=404, detail="Status not found")
    return StatusResponse.model_validate(status)
