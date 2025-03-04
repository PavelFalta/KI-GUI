from app import models
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.src.completion.schemas import CompletionCreate, CompletionResponse


def get_completions(sql: Session) -> list[CompletionResponse]:
    """_summary_
    Args:
        sql (Session): _description_
    Returns:
        list[CompletionResponse]: _description_
    """
    try:
        return [
            CompletionResponse.model_validate(completion)
            for completion in sql.query(models.Completion).all()
        ]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_completion(sql: Session, data: CompletionCreate) -> CompletionResponse:
    """_summary_
    Args:
        sql (Session): _description_
        data (CompletionCreate): _description_
    Returns:
        CompletionsResponse: _description_
    """
    try:
        new_completion = models.Completion(**data.model_dump())
        sql.add(new_completion)
        sql.commit()
        sql.refresh(new_completion)
        return CompletionResponse.model_validate(new_completion)
    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Completion already exists") from e
    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_completion(
    sql: Session, data: CompletionCreate, completion_id: int
) -> CompletionResponse:
    """_summary_
    Args:
        sql (Session): _description_
        data (CompletionCreate): _description_
        completion_id (int): _description_
    Returns:
        CompletionResponse: _description_
    """
    try:
        completion: models.Completion = (
            sql.query(models.Completion)
            .filter(models.Completion.id == completion_id)
            .first()
        )
        if not completion:
            raise HTTPException(status_code=404, detail="Completion not found")
        for var, value in vars(data).items():
            setattr(completion, var, value)
        sql.commit()
        sql.refresh(completion)
        return CompletionResponse.model_validate(completion)

    except HTTPException as e:
        raise e

    except IntegrityError as e:
        sql.rollback()
        raise HTTPException(status_code=409, detail="Completion already exists") from e
    except Exception as e:
        sql.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_completion(sql: Session, completion_id: int) -> CompletionResponse:
    """_summary_
    Args:
        sql (Session): _description_
        completion_id (int): _description_
    Returns:
        CompletionResponse: _description_
    """
    try:
        completion: models.Completion | None = (
            sql.query(models.Completion).filter(models.Completion.id == completion_id).first()
        )
        if not completion:
            raise HTTPException(status_code=404, detail="Completion not found")
        return CompletionResponse.model_validate(completion)
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
    

def delete_completion(sql: Session, completion_id: int) -> CompletionResponse:
    """_summary_
    Args:
        sql (Session): _description_
        completion_id (int): _description_
    Returns:
        CompletionResponse: _description_
    """
    try:
        completion: models.Completion | None = (
            sql.query(models.Completion).filter(models.Completion.id == completion_id).first()
        )
        if not completion:
            raise HTTPException(status_code=404, detail="Completion not found")
        sql.delete(completion)
        sql.commit()
        return CompletionResponse.model_validate(completion)
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
