from typing import Annotated

from app.annotations import ID_PATH_ANNOTATION
from app.src.courses.controllers import (
    create_course,
    delete_course,
    get_course,
    update_course,
    get_courses,
)
from app.src.courses.schemas import CourseCreate, CourseResponse, CourseUpdate
from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_sql

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("", summary="Get all courses", operation_id="getCourses")
def endp_get_courses(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[CourseResponse]:
    return get_courses(sql=sql)


@router.post("", summary="Create a course", operation_id="createCourses")
def endp_create_course(
    sql: Annotated[Session, Depends(get_sql)], data: CourseCreate
) -> CourseResponse:
    return create_course(sql=sql, data=data)


@router.put("/{course_id}", summary="Update a course", operation_id="updateCourse")
def endp_update_course(
    course_id: ID_PATH_ANNOTATION,
    sql: Annotated[Session, Depends(get_sql)],
    data: CourseUpdate,
) -> CourseResponse:
    return update_course(sql=sql, data=data, course_id=course_id)


@router.get("/{course_id}", summary="Get a course", operation_id="getCourse")
def endp_get_course(
    sql: Annotated[Session, Depends(get_sql)], course_id: ID_PATH_ANNOTATION
) -> CourseResponse:
    return get_course(sql=sql, course_id=course_id)


@router.delete("/{course_id}", summary="Delete a course", operation_id="deleteCourse", status_code=204)
def endp_delete_course(
    course_id: ID_PATH_ANNOTATION, sql: Annotated[Session, Depends(get_sql)]
) -> None:
    return delete_course(sql=sql, course_id=course_id)
