from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models
from app.src.tasks.schemas import TaskCreate, TaskResponse, TaskUpdate
from app.src.users.schemas import UserResponse
from sqlalchemy.exc import IntegrityError


def get_tasks(sql: Session) -> list[TaskResponse]:
    """Get all tasks from the database

    Args:
        sql (Session): Database session


    Returns:
        list[TaskResponse]: A list of all tasks
    
    Raises:
        HTTPException: 404 if no tasks are found
        HTTPException: 500 for any other errors
    """
    try:
        tasks: list[models.Task] = sql.query(models.Task).all()
        if not tasks:
            raise HTTPException(status_code=404, detail="Task not found")
        return [TaskResponse.model_validate(task) for task in tasks]

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_task(
    sql: Session, data: TaskCreate, current_user: UserResponse
) -> TaskResponse:
    """Create a new task

    This function creates a new task with the currently logged in user as creator.
    Sets default category to "Uncategorized" if not specified.

    Args:
        sql (Session): Database session
        data (TaskCreate): Task data from request
        current_user (UserResponse): Currently logged in user from token

    Returns:
        TaskResponse: Created task

    Raises:
        HTTPException: 403 if user doesn't have required role
        HTTPException: 409 if task already exists
        HTTPException: 500 for other errors
    """
    try:
        if (
            current_user.role_id != 1  # Admin = role_id 1?
        ):
            raise HTTPException(
                status_code=403, detail="Only administrators can create tasks"
            )

        if not data.category_id:
            uncategorized = (
                sql.query(models.Category)
                .filter(models.Category.name == "Uncategorized")
                .first()
            )  # Check jestli existuje kategorie Uncategorized

            if not uncategorized:
                uncategorized = models.Category(
                    name="uncategorized",
                    description="Default category for uncategorized tasks",
                )
                sql.add(uncategorized)  # Přidání kategorie Uncategorized do databáze
                sql.commit()
                sql.refresh(uncategorized)

            data.category_id = uncategorized.id

        task_data = data.model_dump()
        task_data["creator_id"] = current_user.id

        new_task: models.Task = models.Task(**task_data)  # New task from data dud
        sql.add(new_task)
        sql.commit()
        sql.refresh(new_task)

        task_to_validate = (
            sql.query(models.Task).filter(models.Task.id == new_task.id).first()
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


def update_task(sql: Session, data: TaskUpdate, task_id: int) -> TaskResponse:
    """Update a task by ID

    Args:
        sql (Session): Database session
        data (TaskUpdate): Task data from request
        task_id (int): ID of the task to update

    Returns:
        TaskResponse: Updated task
    
    Raises:
        HTTPException: 404 if task not found
        HTTPException: 409 if task already exists
        HTTPException: 500 for any other errors
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
    """Get a task by ID

    Args:
        sql (Session): Database session
        task_id (int): ID of the task to get

    Returns:
        TaskResponse: Task data

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
        return TaskResponse.model_validate(task)

    except HTTPException as e:
        raise e

    except Exception as e:
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
