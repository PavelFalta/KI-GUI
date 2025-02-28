from typing import Annotated

from app.annotations import ID_PATH_ANNOTATION
from app.src.statuses.controllers import (
    create_status,
    delete_status,
    get_statuses,
    update_status,
    get_status,
)
from app.src.statuses.schemas import StatusCreate, StatusResponse, StatusUpdate
from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_sql

router = APIRouter(prefix="/statuses", tags=["Statuses"])


@router.get("", summary="Get all statuses", operation_id="getStatuses")
def endp_get_statuses(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[StatusResponse]:
    return get_statuses(sql=sql)


@router.post("", summary="Create a status", operation_id="createStatus")
def endp_create_status(
    sql: Annotated[Session, Depends(get_sql)], data: StatusCreate
) -> StatusResponse:
    return create_status(sql=sql, data=data)


@router.put("/{status_id}", summary="Update a status", operation_id="updateStatus")
def endp_update_status(
    status_id: ID_PATH_ANNOTATION,
    sql: Annotated[Session, Depends(get_sql)],
    data: StatusUpdate,
) -> StatusResponse:
    return update_status(sql=sql, data=data, status_id=status_id)


@router.get("/{status_id}", summary="Get a status", operation_id="getStatus")
def endp_get_status(
    sql: Annotated[Session, Depends(get_sql)], status_id: ID_PATH_ANNOTATION
) -> StatusResponse:
    return get_status(sql=sql, status_id=status_id)


@router.delete("/{status_id}", summary="Delete a status", operation_id="deleteStatus", status_code=204)
def endp_delete_status(
    status_id: ID_PATH_ANNOTATION, sql: Annotated[Session, Depends(get_sql)]
) -> None:
    return delete_status(sql=sql, status_id=status_id)
