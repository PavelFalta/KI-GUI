from typing import Annotated
from app.src.statuses.controllers import create_status, get_statuses, update_status, get_status
from app.src.statuses.schemas import StatusCreate, StatusResponse, StatusUpdate
from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_sql

router = APIRouter(prefix="/statuses", tags=["Statuses"])


@router.get("")
def endp_get_statuses(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[StatusResponse]:
    return get_statuses(sql=sql)


@router.post("")
def endp_create_status(
    sql: Annotated[Session, Depends(get_sql)], data: StatusCreate
) -> StatusResponse:
    return create_status(sql=sql, data=data)


@router.put("/{status_id}")
def endp_update_status(
    sql: Annotated[Session, Depends(get_sql)], data: StatusUpdate, status_id: int
) -> StatusResponse:
    return update_status(sql=sql, data=data, status_id=status_id)


@router.get("/{status_id}")
def endp_get_status(
    sql: Annotated[Session, Depends(get_sql)], status_id: int
) -> StatusResponse:
    return get_status(sql=sql, status_id=status_id)