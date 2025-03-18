from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models
from app.src.tasks.schemas import TaskCreate, TaskResponse, TaskUpdate
from sqlalchemy.exc import IntegrityError
from app.utils import validate_int


def get_tasks(sql: Session) -> list[TaskResponse]:
    try:
        tasks: list[models.Task] = (
            sql.query(models.Task).filter(models.Task.is_active == True).all()
        )
        return [TaskResponse.model_validate(task) for task in tasks]

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error: ") from e


def create_task(
    sql: Session,
    data: TaskCreate,
) -> TaskResponse:
    try:
        task_data = data.model_dump()
        new_task: models.Task = models.Task(**task_data)
        course: models.Course | None = sql.get(
            models.Course, validate_int(new_task.course_id)
        )
        if course is None or not course.is_active:
            raise HTTPException(status_code=404, detail="Course not found")

        sql.add(new_task)
        sql.commit()
        sql.refresh(new_task)
        return TaskResponse.model_validate(new_task)

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Task already exists") from e

    except HTTPException as e:
        sql.rollback()
        raise e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_task(sql: Session, data: TaskUpdate, task_id: int) -> TaskResponse:
    try:
        task: models.Task | None = sql.get(models.Task, validate_int(task_id))
        if task is None or not task.is_active:
            raise HTTPException(status_code=404, detail="Task not found")

        if data.course_id is not None:
            course: models.Course | None = sql.get(
                models.Course, validate_int(data.course_id)
            )
            if course is None or not course.is_active:
                raise HTTPException(status_code=404, detail="Course not found")

        for var, value in vars(data).items():
            if value is not None:
                setattr(task, var, value)

        sql.commit()
        sql.refresh(task)
        return TaskResponse.model_validate(task)

    except HTTPException as e:
        raise e

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Task already exists") from e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_task(sql: Session, task_id: int) -> TaskResponse:
    try:
        task: models.Task | None = sql.get(models.Task, validate_int(task_id))
        if task is None or not task.is_active:
            raise HTTPException(status_code=404, detail="Task not found")
        return TaskResponse.model_validate(task)

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def delete_task(sql: Session, task_id: int):
    try:
        task: models.Task | None = sql.get(models.Task, validate_int(task_id))
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")

        task.is_active = False
        sql.commit()
        sql.refresh(task)

    except HTTPException as e:
        raise e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e
