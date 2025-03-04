from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models
from app.src.students_courses.schemas import (
    StudentCourseCreate,
    StudentCourseResponse,
    StudentCourseUpdate,
)

from sqlalchemy.exc import IntegrityError


def get_students_courses(sql: Session) -> list[StudentCourseResponse]:
    """_summary_

    Args:
        sql (Session): _description_

    Raises:
        HTTPException: _description_

    Returns:
        list[StudentCourseResponse]: _description_
    """
    try:
        return [
            StudentCourseResponse.model_validate(student_course)
            for student_course in sql.query(models.StudentCourse).all()
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_student_course(
    sql: Session, data: StudentCourseCreate
) -> StudentCourseResponse:
    """_summary_

    Args:
        sql (Session): _description_
        data (StudentCourseCreate): _description_

    Raises:
        HTTPException: _description_
        HTTPException: _description_
        HTTPException: _description_
        e: _description_
        HTTPException: _description_
        HTTPException: _description_

    Returns:
        StudentCourseResponse: _description_
    """
    try:
        student = (
            sql.get(models.User, data.student_id)
        )
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        course = (
            sql.get(models.Course, data.course_id)
        )
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        assigner = (
            sql.get(models.User, data.assigned_by)
        )
        if not assigner:
            raise HTTPException(status_code=404, detail="Assigner not found")

        new_student_course: models.StudentCourse = models.StudentCourse(
            **data.model_dump()
        )
        sql.add(new_student_course)
        sql.commit()
        sql.refresh(new_student_course)

        return StudentCourseResponse.model_validate(new_student_course)

    except HTTPException as e:
        sql.rollback()
        raise e

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(
            status_code=409, detail="Student course enrollment already exists"
        ) from e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_student_course(
    sql: Session, data: StudentCourseUpdate, student_course_id: int
) -> StudentCourseResponse:
    """_summary_

    Args:
        sql (Session): _description_
        data (StudentCourseUpdate): _description_
        student_course_id (int): _description_

    Raises:
        HTTPException: _description_
        HTTPException: _description_
        HTTPException: _description_
        HTTPException: _description_
        e: _description_
        HTTPException: _description_
        HTTPException: _description_

    Returns:
        StudentCourseResponse: _description_
    """
    try:
        student_course = (
            sql.query(models.StudentCourse)
            .filter(models.StudentCourse.id == student_course_id)
            .first()
        )
        if not student_course:
            raise HTTPException(
                status_code=404, detail="Student course enrollment not found"
            )

        if data.student_id is not None:
            if (
                not sql.query(models.User)
                .filter(models.User.id == data.student_id)
                .first()
            ):
                raise HTTPException(status_code=404, detail="Student not found")

        if data.course_id is not None:
            if (
                not sql.query(models.Course)
                .filter(models.Course.id == data.course_id)
                .first()
            ):
                raise HTTPException(status_code=404, detail="Course not found")

        if data.assigned_by is not None:
            if (
                not sql.query(models.User)
                .filter(models.User.id == data.assigned_by)
                .first()
            ):
                raise HTTPException(status_code=404, detail="Assigner not found")

        for key, value in data.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(student_course, key, value)

        sql.commit()
        sql.refresh(student_course)
        return StudentCourseResponse.model_validate(student_course)

    except HTTPException as e:
        raise e

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(
            status_code=409, detail="Error updating student course enrollment"
        ) from e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_student_course(sql: Session, student_course_id: int) -> StudentCourseResponse:
    """_summary_

    Args:
        sql (Session): _description_
        student_course_id (int): _description_

    Raises:
        HTTPException: _description_
        e: _description_
        HTTPException: _description_

    Returns:
        StudentCourseResponse: _description_
    """
    try:
        student_course = (
            sql.query(models.StudentCourse)
            .filter(models.StudentCourse.id == student_course_id)
            .first()
        )
        if not student_course:
            raise HTTPException(
                status_code=404, detail="Student course enrollment not found"
            )
        return StudentCourseResponse.model_validate(student_course)

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def delete_student_course(sql: Session, student_course_id: int):
    """_summary_

    Args:
        sql (Session): _description_
        student_course_id (int): _description_

    Raises:
        HTTPException: _description_
        e: _description_
        HTTPException: _description_
    """
    try:
        student_course = (
            sql.query(models.StudentCourse)
            .filter(models.StudentCourse.id == student_course_id)
            .first()
        )
        if not student_course:
            raise HTTPException(
                status_code=404, detail="Student course enrollment not found"
            )

        sql.delete(student_course)
        sql.commit()

    except HTTPException as e:
        raise e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e
