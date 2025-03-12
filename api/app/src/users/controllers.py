from app import models
from app.src.users.schemas import (
    UserCreate,
    UserResponse,
    UserResponseTasksAndCourses,
    UserUpdate,
)
from app.utils import validate_int
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, OperationalError


def create_user(sql: Session, data: UserCreate) -> UserResponse:
    try:
        new_user: models.User = models.User(**data.model_dump())

        role: models.Role | None = sql.get(models.Role, validate_int(new_user.role_id))
        if role is None:
            raise HTTPException(status_code=404, detail="Role not found")
        sql.add(new_user)
        sql.commit()
        sql.refresh(new_user)
        return UserResponse.model_validate(new_user)
    
    except HTTPException as e:
        raise e from e

    except IntegrityError as e:
        raise HTTPException(status_code=409, detail=str(e.orig)) from e

    except OperationalError as e:
        raise HTTPException(status_code=500, detail=str(e.orig)) from e
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Unexpected error") from e


def get_users(sql: Session) -> list[UserResponse]:
    try:
        users: list[models.User] = (
            sql.query(models.User).where(models.User.is_active == True).all()
        )
        if not users:
            raise HTTPException(status_code=404, detail="Users not found")
        return [UserResponse.model_validate(user) for user in users]

    except HTTPException as e:
        raise e

    except OperationalError as e:
        raise HTTPException(status_code=500, detail=str(e.orig)) from e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Unexpected error") from e


def get_user(sql: Session, user_id: int) -> UserResponse:
    try:
        user: models.User | None = sql.get(models.User, validate_int(user_id))
        if user is None or not user.is_active:
            raise HTTPException(status_code=404, detail="User not found")

        return UserResponse.model_validate(user)

    except HTTPException as e:
        raise e from e

    except OperationalError as e:
        raise HTTPException(status_code=500, detail=str(e.orig)) from e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Unexpected error") from e


def update_user(sql: Session, user_id: int, data: UserUpdate) -> UserResponse:
    try:
        user: models.User | None = sql.get(models.User, validate_int(user_id))
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        if data.role_id is not None:
            role: models.Role | None = sql.get(models.Role, validate_int(data.role_id))
            if role is None:
                raise HTTPException(status_code=404, detail="Role not found")

        for key, value in data.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(user, key, value)

        sql.commit()
        sql.refresh(user)
        return UserResponse.model_validate(user)

    except HTTPException as e:
        raise e from e

    except IntegrityError as e:
        raise HTTPException(status_code=409, detail=str(e.orig)) from e

    except OperationalError as e:
        raise HTTPException(status_code=500, detail=str(e.orig)) from e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Unexpected error") from e


def get_user_tasks_and_courses(
    sql: Session, user_id: int
) -> UserResponseTasksAndCourses:
    user = sql.get(models.User, validate_int(user_id))
    if user is None or not user.is_active:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponseTasksAndCourses.model_validate(user)
