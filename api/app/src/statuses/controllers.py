from fastapi import HTTPException
from fastapi.exceptions import ResponseValidationError
from sqlalchemy.orm import Session
from app import models
from app.src.statuses.schemas import StatusCreate, StatusResponse, StatusUpdate

from sqlalchemy.exc import IntegrityError, SQLAlchemyError, OperationalError


def get_statuses(sql: Session) -> list[StatusResponse]:
    """_summary_

    Args:
        sql (Session): _description_


    Returns:
        list[StatusResponse]: _description_
    """
    try:
        return [
            StatusResponse.model_validate(status)
            for status in sql.query(models.Status).all()
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_status(sql: Session, data: StatusCreate) -> StatusResponse:
    """_summary_

    Args:
        sql (Session): _description_
        data (StatusCreate): _description_

    Returns:
        StatusResponse: _description_
    """
    try:
        new_status: models.Status = models.Status(**data.model_dump())
        sql.add(new_status)
        sql.commit()
        sql.refresh(new_status)

        return StatusResponse.model_validate(new_status)

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Status already exists") from e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_status(sql: Session, data: StatusUpdate, status_id: int) -> StatusResponse:
    """_summary_

    Args:
        sql (Session): _description_
        data (StatusUpdate): _description_
        status_id (int): _description_

    Returns:
        StatusResponse: _description_
    """
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
    except HTTPException as e:
        raise e
    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Status already exists") from e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_status(sql: Session, status_id: int) -> StatusResponse:
    """

    Args:
        sql (Session): _description_
        status_id (int): _description_


    Returns:
        StatusResponse: _description_
    """
    try:
        status: models.Status | None = (
            sql.query(models.Status).filter(models.Status.id == status_id).first()
        )
        if not status:
            raise HTTPException(status_code=404, detail="Status not found")
        return StatusResponse.model_validate(status)

    except HTTPException as e:
        raise e
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
    
    
def delete_status(sql: Session, status_id: int):
    try:
        status: models.Status | None = (
            sql.query(models.Status).filter(models.Status.id == status_id).first()
        )
        if not status:
            raise HTTPException(status_code=404, detail="Status not found")
        sql.delete(status)
        sql.commit()
        # return StatusResponse.model_validate(status)

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
