from typing import Annotated
from app.src.statuses.controllers import create_status, get_statuses
from app.src.statuses.schemas import StatusCreate, StatusResponse
from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_sql

router = APIRouter(prefix="/statuses", tags=["Statuses"])


@router.get("/")
def endp_get_statuses(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[StatusResponse]:
    return get_statuses(sql=sql)


@router.post("/")
def endp_create_status(
    sql: Annotated[Session, Depends(get_sql)], data: StatusCreate
) -> StatusResponse:
    return create_status(sql=sql, data=data)


# @router.get("/{status_id}")
