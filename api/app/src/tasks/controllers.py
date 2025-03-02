from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models
from app.src.tasks.schemas import TaskCreate, TaskResponse, TaskUpdate
from sqlalchemy.exc import IntegrityError


def get_tasks(sql: Session) -> list[TaskResponse]:
    """_summary_

    Args:
        sql (Session): _description_


    Returns:
        list[TaskResponse]: _description_
    """
    try:
        return [
            TaskResponse.model_validate(task) for task in sql.query(models.Task).all()
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_task(sql: Session, data: TaskCreate) -> TaskResponse:
    """_summary_

    Args:
        sql (Session): _description_
        data (TaskCreate): _description_

    Returns:
        StatusResponse: _description_
    """
    try:
        new_task: models.Task = models.Task(**data.model_dump())
        sql.add(new_task)
        sql.commit()
        sql.refresh(new_task)

        return TaskResponse.model_validate(new_task)

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Task already exists") from e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_task(sql: Session, data: TaskUpdate, task_id: int) -> TaskResponse:
    """_summary_

    Args:
        sql (Session): _description_
        data (TaskUpdate): _description_
        task_id (int): _description_

    Returns:
        TaskResponse: _description_
    """
    try:
        task: models.Task = (
            sql.query(models.Task).filter(models.Task.id == task_id).first()
        )
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
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
    """

    Args:
        sql (Session): _description_
        task_id (int): _description_


    Returns:
        TaskResponse: _description_
    """
    try:
        task: models.Task | None = (
            sql.query(models.Task).filter(models.Task.id == task_id).first()
        )
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return TaskResponse.model_validate(task)

    except HTTPException as e:
        raise e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def delete_task(sql: Session, task_id: int):
    """Soft delete a task by setting is_active to False

    Args:
        sql (Session): Database session
        task_id (int): ID of the task to delete

    Raises:
        HTTPException: 404 if task not found
        HTTPException: 500 for any other errors
    """
    try:
        task: models.Task | None = (
            sql.query(models.Task).filter(models.Task.id == task_id).first()
        )
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        task.is_active = False
        sql.commit()
        sql.refresh(task)

    except HTTPException as e:
        raise e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e
