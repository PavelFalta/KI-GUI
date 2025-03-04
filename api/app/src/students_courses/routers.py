from typing import Annotated

from app.annotations import ID_PATH_ANNOTATION
from app.src.students_courses.controllers import (
    create_student_course,
    delete_student_course,
    get_student_course,
    update_student_course,
    get_students_courses,
)
from app.src.students_courses.schemas import StudentCourseCreate, StudentCourseResponse, StudentCourseUpdate
from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_sql

router = APIRouter(prefix="/students-courses", tags=["Students Courses"])


@router.get("", summary="Get all student course enrollments", operation_id="getStudentsCourses")
def endp_get_students_courses(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[StudentCourseResponse]:
    return get_students_courses(sql=sql)


@router.post("", summary="Create a student course enrollment", operation_id="createStudentCourse")
def endp_create_student_course(
    sql: Annotated[Session, Depends(get_sql)], data: StudentCourseCreate
) -> StudentCourseResponse:
    return create_student_course(sql=sql, data=data)


@router.put("/{student_course_id}", summary="Update a student course enrollment", operation_id="updateStudentCourse")
def endp_update_student_course(
    student_course_id: ID_PATH_ANNOTATION,
    sql: Annotated[Session, Depends(get_sql)],
    data: StudentCourseUpdate,
) -> StudentCourseResponse:
    pass
    # return update_student_course(sql=sql, data=data, student_course_id=student_course_id)


@router.get("/{student_course_id}", summary="Get a student course enrollment", operation_id="getStudentCourse")
def endp_get_student_course(
    sql: Annotated[Session, Depends(get_sql)], student_course_id: ID_PATH_ANNOTATION
) -> StudentCourseResponse:
    return get_student_course(sql=sql, student_course_id=student_course_id)


@router.delete(
    "/{student_course_id}",
    summary="Delete a student course enrollment",
    operation_id="deleteStudentCourse",
    status_code=204,
)
def endp_delete_student_course(
    student_course_id: ID_PATH_ANNOTATION, sql: Annotated[Session, Depends(get_sql)]
) -> None:
    return delete_student_course(sql=sql, student_course_id=student_course_id)