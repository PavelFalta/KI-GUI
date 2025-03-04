from typing import Annotated
from app.database import get_sql
from app.src.completion.controllers import (
    create_completion,
    get_completions,
    get_completion,
    update_completion,
    delete_completion,
)
from app.src.completion.schemas import CompletionCreate, CompletionResponse
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/completion", tags=["Completion"])


@router.get("", summary="Get all completions", operation_id="getCompletions")
def endp_get_completions(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[CompletionResponse]:
    return get_completions(sql=sql)


@router.post("", summary="Create a completion", operation_id="createCompletion")
def endp_create_completion(
    sql: Annotated[Session, Depends(get_sql)], data: CompletionCreate
) -> CompletionResponse:
    return create_completion(sql=sql, data=data)


@router.put(
    "/{completion_id}", summary="Update a completion", operation_id="updateCompletion"
)
def endp_update_completion(
    completion_id: int,
    sql: Annotated[Session, Depends(get_sql)],
    data: CompletionCreate,
) -> CompletionResponse:
    return update_completion(sql=sql, data=data, completion_id=completion_id)


@router.get("/{completion_id}", summary="Get a completion", operation_id="getCompletion")
def endp_get_completion(
    sql: Annotated[Session, Depends(get_sql)], completion_id: int
) -> CompletionResponse:
    return get_completion(sql=sql, completion_id=completion_id)

@router.delete("/{completion_id}", summary="Delete a completion", operation_id="deleteCompletion", status_code=204)
def endp_delete_completion(
    completion_id: int, sql: Annotated[Session, Depends(get_sql)]
) -> None:
    return delete_completion(sql=sql, completion_id=completion_id)