from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models
from app.src.courses.schemas import CourseCreate, CourseResponse, CourseUpdate

from sqlalchemy.exc import IntegrityError


def get_courses(sql: Session) -> list[CourseResponse]:
    """_summary_

    Args:
        sql (Session): _description_


    Returns:
        list[CourseResponse]: _description_
    """
    try:
        return [
            CourseResponse.model_validate(course)
            for course in sql.query(models.Course).all()
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_course(sql: Session, data: CourseCreate) -> CourseResponse:
    """_summary_

    Args:
        sql (Session): _description_
        data (CourseCreate): _description_

    Returns:
        StatusResponse: _description_
    """
    try:
        new_course: models.Course = models.Course(**data.model_dump())
        sql.add(new_course)
        sql.commit()
        sql.refresh(new_course)

        return CourseResponse.model_validate(new_course)

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Course already exists") from e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_course(sql: Session, data: CourseUpdate, course_id: int) -> CourseResponse:
    """_summary_

    Args:
        sql (Session): _description_
        data (CourseUpdate): _description_
        course_id (int): _description_

    Returns:
        CourseResponse: _description_
    """
    try:
        course: models.Course = (
            sql.query(models.Course).filter(models.Course.id == course_id).first()
        )
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        for var, value in vars(data).items():
            if value is not None:
                setattr(course, var, value)
        sql.commit()
        sql.refresh(course)
        return CourseResponse.model_validate(course)
    
    except HTTPException as e:
        raise e
    
    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Course already exists") from e
    
    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_course(sql: Session, course_id: int) -> CourseResponse:
    """

    Args:
        sql (Session): _description_
        course_id (int): _description_


    Returns:
        CourseResponse: _description_
    """
    try:
        course: models.Course | None = (
            sql.query(models.Course).filter(models.Course.id == course_id).first()
        )
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        return CourseResponse.model_validate(course)

    except HTTPException as e:
        raise e
    
    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e
    
    
def delete_course(sql: Session, course_id: int):
    try:
        course: models.Course | None = (
            sql.query(models.Course).filter(models.Course.id == course_id).first()
        )
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        sql.delete(course)
        sql.commit()
        # return StatusResponse.model_validate(course)

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
