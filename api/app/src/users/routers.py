from typing import Annotated
from app.annotations import ID_PATH_ANNOTATION
from app.database import get_sql
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.src.users.schemas import UserCreate, UserResponse, UserUpdate


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", summary="Get all users", operation_id="getUsers")
def endp_get_users(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[UserResponse]:
    pass


@router.post("", summary="Create a user", operation_id="createUsers")
def endp_create_user(
    sql: Annotated[Session, Depends(get_sql)], data: UserCreate
) -> UserResponse:
    pass


@router.put("/{user_id}", summary="Update a user", operation_id="updateUser")
def endp_update_user(
    user_id: ID_PATH_ANNOTATION,
    sql: Annotated[Session, Depends(get_sql)],
    data: UserUpdate,
) -> UserResponse:
    pass


@router.get("/{user_id}", summary="Get a user", operation_id="getUser")
def endp_get_user(
    sql: Annotated[Session, Depends(get_sql)], user_id: ID_PATH_ANNOTATION
) -> UserResponse:
    pass
