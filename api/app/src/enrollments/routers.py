from typing import Annotated

from app.annotations import ID_PATH_ANNOTATION
from app.src.enrollments.controllers import (
    create_enrollment,
    delete_enrollment,
    get_enrollment,
    get_enrollments,
    update_enrollment,
    get_task_completions_for_user,
)
from app.src.enrollments.schemas import EnrollmentCreate, EnrollmentResponse, EnrollmentUpdate
from fastapi import APIRouter, Depends
from app.src.enrollments.schemas import EnrollmentResponseTasks
from sqlalchemy.orm import Session

from app.database import get_sql

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])


@router.get("", summary="Get all student course enrollments", operation_id="getEnrollments")
def endp_get_enrollments(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[EnrollmentResponse]:
    return get_enrollments(sql=sql)


@router.post("", summary="Create a student course enrollment", operation_id="createEnrollment")
def endp_create_enrollment(
    sql: Annotated[Session, Depends(get_sql)], data: EnrollmentCreate
) -> EnrollmentResponse:
    return create_enrollment(sql=sql, data=data)


@router.put("/{enrollment_id}", summary="Update a student course enrollment", operation_id="updateEnrollment")
def endp_update_enrollment(
    enrollment_id: ID_PATH_ANNOTATION,
    sql: Annotated[Session, Depends(get_sql)],
    data: EnrollmentUpdate,
) -> EnrollmentResponse:
    pass
    return update_enrollment(sql=sql, data=data, enrollment_id=enrollment_id)


@router.get("/{enrollment_id}", summary="Get a student course enrollment", operation_id="getEnrollment")
def endp_get_enrollment(
    sql: Annotated[Session, Depends(get_sql)], enrollment_id: ID_PATH_ANNOTATION
) -> EnrollmentResponse:
    return get_enrollment(sql=sql, enrollment_id=enrollment_id)


@router.delete(
    "/{enrollment_id}",
    summary="Delete a student course enrollment",
    operation_id="deleteEnrollment",
    status_code=204,
)
def endp_delete_enrollment(
    enrollment_id: ID_PATH_ANNOTATION, sql: Annotated[Session, Depends(get_sql)]
) -> None:
    return delete_enrollment(sql=sql, enrollment_id=enrollment_id)


@router.get("/{user_id}/task_completion", summary="Get all task completions for a user", operation_id="getTaskCompletionsForUser")
def endp_get_task_completions_for_user(
    sql: Annotated[Session, Depends(get_sql)], user_id: ID_PATH_ANNOTATION
) -> EnrollmentResponseTasks:
    return get_task_completions_for_user(sql=sql, user_id=user_id)