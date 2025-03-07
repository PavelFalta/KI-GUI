from app.src.categories.schemas import CategoryResponse, CategoryCreate, CategoryUpdate
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app import models


def get_categories(sql: Session) -> list[CategoryResponse]:
    try:
        categories: list[models.Category] = sql.query(models.Category).all()
        return [CategoryResponse.model_validate(category) for category in categories]

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_category(sql: Session, data: CategoryCreate) -> CategoryResponse:
    try:
        new_category = models.Category(**data.model_dump())

        sql.add(new_category)
        sql.commit()
        sql.refresh(new_category)
        return CategoryResponse.model_validate(new_category)

    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e.orig)) from e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_category(
    sql: Session, category_id: int, data: CategoryUpdate
) -> CategoryResponse:
    try:
        category: models.Category | None = sql.get(models.Category, category_id)
        if category is None:
            raise HTTPException(status_code=404, detail="Category not found")

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(category, key, value)

        sql.commit()
        sql.refresh(category)
        return CategoryResponse.model_validate(category)

    except HTTPException as e:
        raise e

    except IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e.orig)) from e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_category(sql: Session, category_id: int) -> CategoryResponse:
    try:
        category: models.Category | None = sql.get(models.Category, category_id)
        if category is None or not category.is_active:
            raise HTTPException(status_code=404, detail="Category not found")

        return CategoryResponse.model_validate(category)
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


def delete_category(sql: Session, category_id: int):
    try:
        category: models.Category | None = sql.get(models.Category, category_id)
        if category is None:
            raise HTTPException(status_code=404, detail="Category not found")

        category.is_active = False
        sql.commit()
        sql.refresh(category)
    except HTTPException as e:
        raise e

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error") from e
