from app import models
from app.utils import validate_int
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.src.task_completions.schemas import (
    TaskCompletionCreate,
    TaskCompletionResponse,
)


def get_task_completions(sql: Session) -> list[TaskCompletionResponse]:
    try:
        task_completions: list[models.TaskCompletion] = sql.query(
            models.TaskCompletion
        ).all()
        return [
            TaskCompletionResponse.model_validate(task_completion)
            for task_completion in task_completions
        ]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_task_completion(
    sql: Session, data: TaskCompletionCreate
) -> TaskCompletionResponse:
    try:
        new_task_completion = models.TaskCompletion(**data.model_dump())

        enrollment: models.Enrollment | None = sql.get(
            models.Enrollment, validate_int(data.enrollment_id)
        )
        if enrollment is None or not enrollment.is_active:
            raise HTTPException(status_code=404, detail="Enrollment not found")

        task: models.Task | None = sql.get(models.Task, validate_int(data.task_id))
        if task is None or not task.is_active:
            raise HTTPException(status_code=404, detail="Task not found")

        sql.add(new_task_completion)
        sql.commit()
        sql.refresh(new_task_completion)
        return TaskCompletionResponse.model_validate(new_task_completion)
    except HTTPException as e:
        raise e
    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(
            status_code=409, detail="TaskCompletion already exists"
        ) from e
    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_task_completion(
    sql: Session, data: TaskCompletionCreate, task_completion_id: int
) -> TaskCompletionResponse:
    try:
        task_completion: models.TaskCompletion | None = sql.get(
            models.TaskCompletion, validate_int(task_completion_id)
        )
        if task_completion is None:
            raise HTTPException(status_code=404, detail="TaskCompletion not found")

        if data.enrollment_id is not None:
            enrollment: models.Enrollment | None = sql.get(
                models.Enrollment, validate_int(data.enrollment_id)
            )
            if enrollment is None or not enrollment.is_active:
                raise HTTPException(status_code=404, detail="Enrollment not found")

        if data.task_id is not None:
            task: models.Task | None = sql.get(models.Task, data.task_id)
            if task is None or not task.is_active:
                raise HTTPException(status_code=404, detail="Task not found")

        for var, value in vars(data).items():
            setattr(task_completion, var, value)

        sql.commit()
        sql.refresh(task_completion)
        return TaskCompletionResponse.model_validate(task_completion)

    except HTTPException as e:
        raise e

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(
            status_code=409, detail="TaskCompletion already exists"
        ) from e
    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_task_completion(
    sql: Session, task_completion_id: int
) -> TaskCompletionResponse:
    try:
        task_completion: models.TaskCompletion | None = sql.get(
            models.TaskCompletion, validate_int(task_completion_id)
        )
        if task_completion is None or not task_completion.is_active:
            raise HTTPException(status_code=404, detail="TaskCompletion not found")

        return TaskCompletionResponse.model_validate(task_completion)

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def delete_task_completion(
    sql: Session, task_completion_id: int
) -> TaskCompletionResponse:
    try:
        task_completion: models.TaskCompletion | None = sql.get(
            models.TaskCompletion, validate_int(task_completion_id)
        )
        if task_completion is None:
            raise HTTPException(status_code=404, detail="TaskCompletion not found")
        sql.delete(task_completion)
        sql.commit()
        return TaskCompletionResponse.model_validate(task_completion)

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
