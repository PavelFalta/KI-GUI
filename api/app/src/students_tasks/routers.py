from typing import Annotated
from app.annotations import ID_PATH_ANNOTATION
from sqlalchemy.orm import Session
from app.database import get_sql
from app.src.students_tasks.schemas import (
    StudentTaskCreate,
    StudentTaskResponse,
    StudentTaskUpdate,
)


from fastapi import APIRouter, Depends


router = APIRouter(prefix="/students_tasks", tags=["StudentsTasks"])


@router.get("", summary="Get all students tasks", operation_id="getStudentsTasks")
def endp_get_students_tasks(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[StudentTaskResponse]:
    pass


@router.post("", summary="Create a student task", operation_id="createStudentsTasks")
def endp_create_student_task(
    sql: Annotated[Session, Depends(get_sql)], data: StudentTaskCreate
) -> StudentTaskResponse:
    pass


@router.put(
    "/{student_task_id}",
    summary="Update a student task",
    operation_id="updateStudentTask",
)
def endp_update_student_task(
    student_task_id: ID_PATH_ANNOTATION,
    sql: Annotated[Session, Depends(get_sql)],
    data: StudentTaskUpdate,
) -> StudentTaskResponse:
    pass


@router.get(
    "/{student_task_id}", summary="Get a student task", operation_id="getStudentTask"
)
def endp_get_student_task(
    sql: Annotated[Session, Depends(get_sql)], student_task_id: ID_PATH_ANNOTATION
) -> StudentTaskResponse:
    pass
