from typing import Annotated

from app.annotations import ID_PATH_ANNOTATION
from app.src.tasks.controllers import (
    create_task,
    delete_task,
    get_task,
    update_task,
    get_tasks,
)
from app.src.tasks.schemas import TaskCreate, TaskResponse, TaskUpdate
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_sql

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", summary="Get all tasks", operation_id="getTasks")
def endp_get_tasks(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[TaskResponse]:
    return get_tasks(sql=sql)


@router.post("", summary="Create a task", operation_id="createTasks")
def endp_create_task(
    sql: Annotated[Session, Depends(get_sql)], data: TaskCreate,
) -> TaskResponse:
    return create_task(sql=sql, data=data)


@router.put("/{task_id}", summary="Update a task", operation_id="updateTask")
def endp_update_task(
    task_id: ID_PATH_ANNOTATION,
    sql: Annotated[Session, Depends(get_sql)],
    data: TaskUpdate,
) -> TaskResponse:
    return update_task(sql=sql, data=data, task_id=task_id)


@router.get("/{task_id}", summary="Get a task", operation_id="getTask")
def endp_get_task(
    sql: Annotated[Session, Depends(get_sql)], task_id: ID_PATH_ANNOTATION
) -> TaskResponse:
    return get_task(sql=sql, task_id=task_id)


@router.delete(
    "/{task_id}", summary="Delete a task", operation_id="deleteTask", status_code=204
)
def endp_delete_task(
    task_id: ID_PATH_ANNOTATION, sql: Annotated[Session, Depends(get_sql)],
) -> None:
    return delete_task(sql=sql, task_id=task_id)
