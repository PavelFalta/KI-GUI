from typing import Annotated
from app.database import get_sql
from app.src.completion.controllers import create_completion
from app.src.completion.schemas import CompletionCreate, CompletionResponse
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/completion", tags=["Completion"])


@router.post("", summary="Create a completion", operation_id="createCompletion")
def endp_create_completion(
    sql: Annotated[Session, Depends(get_sql)], data: CompletionCreate
) -> CompletionResponse:
    return create_completion(sql, data)
