from app import models
from sqlalchemy.orm import Session

from app.src.completion.schemas import CompletionCreate, CompletionResponse


def create_completion(sql: Session, data: CompletionCreate) -> CompletionResponse:
    new_completion = models.Completion(**data.model_dump())
    sql.add(new_completion)
    sql.commit()
    sql.refresh(new_completion)
    return CompletionResponse.model_validate(new_completion)
