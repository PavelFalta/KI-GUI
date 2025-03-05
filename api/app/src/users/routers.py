from typing import Annotated
from app.annotations import ID_PATH_ANNOTATION
from app.database import get_sql
from app.src.users.controllers import create_user, get_user, get_user_tasks_and_courses, get_users, update_user
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.src.users.schemas import UserCreate, UserResponse, UserResponseTasksAndCourses, UserUpdate


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", summary="Get all users", operation_id="getUsers")
def endp_get_users(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[UserResponse]:
    return get_users(sql)


@router.post("", summary="Create a user", operation_id="createUsers")
def endp_create_user(
    sql: Annotated[Session, Depends(get_sql)], data: UserCreate
) -> UserResponse:
    return create_user(sql, data)


@router.put("/{user_id}", summary="Update a user", operation_id="updateUser")
def endp_update_user(
    user_id: ID_PATH_ANNOTATION,
    sql: Annotated[Session, Depends(get_sql)],
    data: UserUpdate,
) -> UserResponse:
    return update_user(sql, user_id, data)


@router.get("/{user_id}", summary="Get a user", operation_id="getUser")
def endp_get_user(
    sql: Annotated[Session, Depends(get_sql)], user_id: ID_PATH_ANNOTATION
) -> UserResponse:
    return get_user(sql, user_id)


@router.get("/{user_id}/tasksAndCourses", summary="Get a user", operation_id="getUserTasksAndCourses")
def endp_get_user_task_and_courses(
    sql: Annotated[Session, Depends(get_sql)], user_id: ID_PATH_ANNOTATION
) -> UserResponseTasksAndCourses:
    return get_user_tasks_and_courses(sql, user_id)
