from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models
from app.src.roles.schemas import RoleCreate, RoleResponse, RoleUpdate

from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.orm.query import Query


def get_roles(sql: Session, status: str) -> list[RoleResponse]:
    try:
        roles: Query[models.Role] = sql.query(models.Role)
        if status == "active":
            roles = roles.filter(models.Course.is_active == True)
        elif status == "inactive":
            roles = roles.filter(models.Course.is_active == False)

        roles = roles.all()
        return [RoleResponse.model_validate(role) for role in roles]

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Unexpected error") from e


def create_role(sql: Session, data: RoleCreate) -> RoleResponse:
    try:
        new_role: models.Role = models.Role(**data.model_dump())

        sql.add(new_role)
        sql.commit()
        sql.refresh(new_role)
        return RoleResponse.model_validate(new_role)

    except IntegrityError as e:
        raise HTTPException(status_code=409, detail=str(e.orig)) from e

    except OperationalError as e:
        raise HTTPException(status_code=500, detail=str(e.orig)) from e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Unexpected error") from e


def update_role(sql: Session, data: RoleUpdate, role_id: int) -> RoleResponse:
    try:
        role: models.Role | None = sql.get(models.Role, role_id)
        if role is None:
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
        print(e)
        raise HTTPException(status_code=409, detail="Role already exists") from e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_role(sql: Session, role_id: int) -> RoleResponse:
    try:
        role: models.Role | None = sql.get(models.Role, role_id)
        if role is None:
            raise HTTPException(status_code=404, detail="Role not found")
        return RoleResponse.model_validate(role)

    except HTTPException as e:
        raise e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def delete_role(sql: Session, role_id: int):
    try:
        role: models.Role | None = sql.get(models.Role, role_id)
        if role is None:
            raise HTTPException(status_code=404, detail="Role not found")
        sql.delete(role)
        sql.commit()

    except HTTPException as e:
        raise e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e
