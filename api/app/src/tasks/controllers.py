from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models
from app.src.tasks.schemas import TaskCreate, TaskResponse, TaskUpdate
from sqlalchemy.exc import IntegrityError


def get_tasks(sql: Session) -> list[TaskResponse]:
    try:
        tasks: list[models.Task] = sql.query(models.Task).where(models.Task.is_active == True).all()
        if not tasks:
            raise HTTPException(status_code=404, detail="Task not found")
        return [TaskResponse.model_validate(task) for task in tasks]

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_task(
    sql: Session,
    data: TaskCreate,
) -> TaskResponse:
    try:

        task_data = data.model_dump()
        new_task: models.Task = models.Task(**task_data)  
        course: models.Course | None = sql.get(models.Course, new_task.course_id)
        if course is None or not course.is_active:
            raise HTTPException(status_code=404, detail="Course not found")
        
        sql.add(new_task)
        sql.commit()
        sql.refresh(new_task)

        task_to_validate: models.Task = (
            sql.get(models.Task, new_task.id)
        )

        return TaskResponse.model_validate(task_to_validate)

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Task already exists") from e

    except HTTPException as e:
        sql.rollback()
        raise e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_task(
    sql: Session, data: TaskUpdate, task_id: int
) -> TaskResponse:
    try:
        
        task: models.Task | None = (
            sql.get(models.Task, task_id)
        )
        if task is None or not task.is_active:
            raise HTTPException(status_code=404, detail="Task not found")
        
        if data.course_id is not None:
            course: models.Course | None = sql.get(models.Course, data.course_id)
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
        task: models.Task | None = (
            sql.get(models.Task, task_id)
        )
        if task is None or not task.is_active:
            raise HTTPException(status_code=404, detail="Task not found")
        return TaskResponse.model_validate(task)

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def delete_task(sql: Session, task_id: int):
    try:
       
        task: models.Task | None = (
            sql.get(models.Task, task_id)
        )
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
