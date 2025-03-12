from typing import Annotated
from app.annotations import ID_PATH_ANNOTATION
from app.database import get_sql
from app.src.categories.controllers import (
    create_category,
    get_categories,
    get_category,
    update_category,
    delete_category,
)
from app.src.categories.schemas import CategoryCreate, CategoryResponse, CategoryUpdate
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session


router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", summary="Get all categories", operation_id="getCategories")
def endp_get_categories(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[CategoryResponse]:
    return get_categories(sql)


@router.post("", summary="Create a category", operation_id="createCategories")
def endp_create_category(
    sql: Annotated[Session, Depends(get_sql)], data: CategoryCreate
) -> CategoryResponse:
    return create_category(sql, data)


@router.put(
    "/{category_id}", summary="Update a category", operation_id="updateCategory"
)
def endp_update_category(
    category_id: ID_PATH_ANNOTATION,
    sql: Annotated[Session, Depends(get_sql)],
    data: CategoryUpdate,
) -> CategoryResponse:
    return update_category(sql, category_id, data)


@router.get("/{category_id}", summary="Get a category", operation_id="getCategory")
def endp_get_category(
    sql: Annotated[Session, Depends(get_sql)], category_id: ID_PATH_ANNOTATION
) -> CategoryResponse:
    return get_category(sql, category_id)


@router.delete(
    "/{category_id}",
    summary="Delete a category",
    operation_id="deleteCategory",
    status_code=204,
)
def endp_delete_category(
    category_id: ID_PATH_ANNOTATION, sql: Annotated[Session, Depends(get_sql)]
):
    return delete_category(sql, category_id)
