from typing import Annotated
from app.database import get_sql
from app.src.task_completions.controllers import (
    create_task_completion,
    get_task_completions,
    get_task_completion,
    update_task_completion,
    delete_task_completion,
)
from app.src.task_completions.schemas import TaskCompletionCreate, TaskCompletionResponse
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/task_completion", tags=["TaskCompletion"])


@router.get("", summary="Get all task_completions", operation_id="getTaskCompletions")
def endp_get_task_completions(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[TaskCompletionResponse]:
    return get_task_completions(sql=sql)


@router.post("", summary="Create a task_completion", operation_id="createTaskCompletion")
def endp_create_task_completion(
    sql: Annotated[Session, Depends(get_sql)], data: TaskCompletionCreate
) -> TaskCompletionResponse:
    return create_task_completion(sql=sql, data=data)


@router.put(
    "/{task_completion_id}",
    summary="Update a task_completion",
    operation_id="updateTaskCompletion",
)
def endp_update_task_completion(
    task_completion_id: int,
    sql: Annotated[Session, Depends(get_sql)],
    data: TaskCompletionCreate,
) -> TaskCompletionResponse:
    return update_task_completion(
        sql=sql, data=data, task_completion_id=task_completion_id
    )


@router.get(
    "/{task_completion_id}",
    summary="Get a task_completion",
    operation_id="getTaskCompletion",
)
def endp_get_task_completion(
    sql: Annotated[Session, Depends(get_sql)], task_completion_id: int
) -> TaskCompletionResponse:
    return get_task_completion(sql=sql, task_completion_id=task_completion_id)


@router.delete(
    "/{task_completion_id}",
    summary="Delete a task_completion",
    operation_id="deleteTaskCompletion",
    status_code=204,
)
def endp_delete_task_completion(
    task_completion_id: int, sql: Annotated[Session, Depends(get_sql)]
) -> None:
    return delete_task_completion(sql=sql, task_completion_id=task_completion_id)
