from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models
from app.src.enrollments.schemas import (
    EnrollmentCreate,
    EnrollmentResponse,
    EnrollmentUpdate,
)

from sqlalchemy.exc import IntegrityError


def get_students_courses(sql: Session) -> list[EnrollmentResponse]:
    try:
        enrollments: list[models.Enrollment] = sql.query(models.Enrollment).all()
        if not enrollments:
            raise HTTPException(status_code=404, detail="Student course enrollments not found")
        return [
            EnrollmentResponse.model_validate(enrollment)
            for enrollment in enrollments
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_enrollment(
    sql: Session, data: EnrollmentCreate
) -> EnrollmentResponse:
    try:
        student: models.User | None = sql.get(models.User, data.student_id)
        if student is None or not student.is_active:
            raise HTTPException(status_code=404, detail="Student not found")

        course: models.Course | None = sql.get(models.User, data.course_id)
        if course is None or not course.is_active:
            raise HTTPException(status_code=404, detail="Course not found")
        
        assigner: models.User | None = sql.get(models.User, data.assigner_id)
        if assigner is None or not assigner.is_active:
            raise HTTPException(status_code=404, detail="Assigner not found")

        new_enrollment: models.Enrollment = models.Enrollment(
            **data.model_dump()
        )
        sql.add(new_enrollment)
        sql.commit()
        sql.refresh(new_enrollment)

        return EnrollmentResponse.model_validate(new_enrollment)

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


def update_enrollment(
    sql: Session, data: EnrollmentUpdate, enrollment_id: int
) -> EnrollmentResponse:
    try:
        enrollment: models.Enrollment | None = (
            sql.get(models.Enrollment, enrollment_id)
        )
        if enrollment is None:
            raise HTTPException(
                status_code=404, detail="Student course enrollment not found"
            )

        if data.student_id is not None:
            student: models.User | None = sql.get(models.User, data.student_id)
            if student is None or not student.is_active:
                raise HTTPException(status_code=404, detail="Student not found")

        if data.course_id is not None:
            course: models.Course | None = sql.get(models.User, data.course_id)
            if course is None or not course.is_active:
                raise HTTPException(status_code=404, detail="Course not found")

        if data.assigner_id is not None:
            assigner: models.User | None = sql.get(models.User, data.assigner_id)
            if assigner is None or not assigner.is_active:
                raise HTTPException(status_code=404, detail="Assigner not found")

        for key, value in data.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(enrollment, key, value)

        sql.commit()
        sql.refresh(enrollment)
        return EnrollmentResponse.model_validate(enrollment)

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


def get_enrollment(sql: Session, enrollment_id: int) -> EnrollmentResponse:
    try:
        enrollment: models.Enrollment | None = (
            sql.get(models.Enrollment, enrollment_id)
        )
        if enrollment is None or not enrollment.is_active:
            raise HTTPException(
                status_code=404, detail="Student course enrollment not found"
            )
        return EnrollmentResponse.model_validate(enrollment)

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


def delete_enrollment(sql: Session, enrollment_id: int):
    try:
        enrollment: models.Enrollment | None = (
            sql.get(models.Enrollment, enrollment_id)
        )
        if enrollment is None:
            raise HTTPException(
                status_code=404, detail="Student course enrollment not found"
            )
        
        enrollment.is_active = False
        sql.commit()
        sql.refresh(enrollment)

    except HTTPException as e:
        raise e

    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e
