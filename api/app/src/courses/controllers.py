from app.utils import validate_int
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models
from app.src.courses.schemas import CourseCreate, CourseResponse, CourseUpdate
from sqlalchemy.exc import IntegrityError


def get_courses(sql: Session) -> list[CourseResponse]:
    try:
        courses: list[models.Course] = sql.query(models.Course).all()
        return [CourseResponse.model_validate(course) for course in courses]

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_course(sql: Session, data: CourseCreate) -> CourseResponse:
    try:
        new_course: models.Course = models.Course(**data.model_dump())

        category: models.Category | None = sql.get(models.Category, validate_int(data.category_id))
        if category is None or not category.is_active:
            raise HTTPException(status_code=404, detail="Category not found")

        teacher: models.User | None = sql.get(models.User, validate_int(data.teacher_id))
        if teacher is None or not teacher.is_active:
            raise HTTPException(status_code=404, detail="Teacher not found")

        sql.add(new_course)
        sql.commit()
        sql.refresh(new_course)

        return CourseResponse.model_validate(new_course)
    except HTTPException as e:
        raise e

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Course already exists") from e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_course(sql: Session, data: CourseUpdate, course_id: int) -> CourseResponse:
    try:
        course: models.Course | None = sql.get(models.Course, validate_int(course_id))
        if course is None:
            raise HTTPException(status_code=404, detail="Course not found")

        if data.category_id is not None:
            category: models.Category | None = sql.get(
                models.Category, validate_int(data.category_id)
            )
            if category is None or not category.is_active:
                raise HTTPException(status_code=404, detail="Category not found")

        if data.teacher_id is not None:
            teacher: models.User | None = sql.get(
                models.User, validate_int(data.teacher_id)
            )
            if teacher is None or not teacher.is_active:
                raise HTTPException(status_code=404, detail="Teacher not found")

        for var, value in vars(data).items():
            if value is not None:
                setattr(course, var, value)
        sql.commit()
        sql.refresh(course)
        return CourseResponse.model_validate(course)

    except HTTPException as e:
        raise e

    except IntegrityError as e:
        print(e)
        raise HTTPException(status_code=409, detail="Course already exists") from e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_course(sql: Session, course_id: int) -> CourseResponse:
    try:
        course: models.Course | None = sql.get(models.Course, course_id)
        if course is None or not course.is_active:
            raise HTTPException(status_code=404, detail="Course not found")

        return CourseResponse.model_validate(course)

    except HTTPException as e:
        raise e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def delete_course(sql: Session, course_id: int):
    try:
        course: models.Course | None = sql.get(models.Course, course_id)
        if course is None:
            raise HTTPException(status_code=404, detail="Course not found")

        course.is_active = False
        sql.commit()
        sql.refresh(course)

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
