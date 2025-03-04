from app.src.categories.schemas import CategoryResponse, CategoryCreate, CategoryUpdate
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app import models


def get_categories(sql: Session) -> list[CategoryResponse]:
    try:
        return (
            sql.query(models.Category).filter(models.Category.is_active == True).all()
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_category(sql: Session, data: CategoryCreate) -> CategoryResponse:
    try:
        category = models.Category(**data.model_dump())
        sql.add(category)
        sql.commit()
        sql.refresh(category)
        return category

    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e.orig)) from e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_category(
    sql: Session, category_id: int, data: CategoryUpdate
) -> CategoryResponse:
    try:
        category: models.Category | None = (
            sql.query(models.Category).filter(models.Category.id == category_id).first()
        )
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(category, key, value)

        sql.commit()
        sql.refresh(category)
        return category

    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e.orig)) from e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_category(sql: Session, category_id: int) -> CategoryResponse:
    try:
        category: models.Category | None = (
            sql.query(models.Category).filter(models.Category.id == category_id).first()
        )
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        return category

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e
