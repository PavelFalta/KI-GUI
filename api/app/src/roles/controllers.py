from fastapi import HTTPException
from fastapi.exceptions import ResponseValidationError
from sqlalchemy.orm import Session
from app import models
from app.src.roles.schemas import RoleCreate, RoleResponse, RoleUpdate

from sqlalchemy.exc import IntegrityError, SQLAlchemyError, OperationalError


def get_roles(sql: Session) -> list[RoleResponse]:
    """_summary_

    Args:
        sql (Session): _description_


    Returns:
        list[RoleResponse]: _description_
    """
    try:
        return [
            RoleResponse.model_validate(role)
            for role in sql.query(models.Role).all()
        ]

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_role(sql: Session, data: RoleCreate) -> RoleResponse:
    """_summary_

    Args:
        sql (Session): _description_
        data (RoleCreate): _description_

    Returns:
        StatusResponse: _description_
    """
    try:
        new_role: models.Role = models.Role(**data.model_dump())
        sql.add(new_role)
        sql.commit()
        sql.refresh(new_role)

        return RoleResponse.model_validate(new_role)

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Role already exists") from e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_role(sql: Session, data: RoleUpdate, role_id: int) -> RoleResponse:
    """_summary_

    Args:
        sql (Session): _description_
        data (RoleUpdate): _description_
        role_id (int): _description_

    Returns:
        RoleResponse: _description_
    """
    try:
        role: models.Role = (
            sql.query(models.Role).filter(models.Role.id == role_id).first()
        )
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        for var, value in vars(data).items():
            if value is not None:
                setattr(role, var, value)
        sql.commit()
        sql.refresh(role)
        return RoleResponse.model_validate(role)
    
    except HTTPException as e:
        raise e
    
    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Role already exists") from e
    
    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_role(sql: Session, role_id: int) -> RoleResponse:
    """

    Args:
        sql (Session): _description_
        role_id (int): _description_


    Returns:
        RoleResponse: _description_
    """
    try:
        role: models.Role | None = (
            sql.query(models.Role).filter(models.Role.id == role_id).first()
        )
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        return RoleResponse.model_validate(role)

    except HTTPException as e:
        raise e
    
    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e
    
    
def delete_role(sql: Session, role_id: int):
    try:
        role: models.Role | None = (
            sql.query(models.Role).filter(models.Role.id == role_id).first()
        )
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        sql.delete(role)
        sql.commit()
        # return StatusResponse.model_validate(role)

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
