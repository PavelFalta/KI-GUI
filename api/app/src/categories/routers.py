from typing import Annotated
from app.annotations import ID_PATH_ANNOTATION
from app.database import get_sql
from app.src.categories.schemas import CategoryCreate, CategoryResponse, CategoryUpdate
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session


router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", summary="Get all categories", operation_id="getCategories")
def endp_get_categories(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[CategoryResponse]:
    pass


@router.post("", summary="Create a category", operation_id="createCategories")
def endp_create_category(
    sql: Annotated[Session, Depends(get_sql)], data: CategoryCreate
) -> CategoryResponse:
    pass


@router.put(
    "/{category_id}", summary="Update a category", operation_id="updateCategory"
)
def endp_update_category(
    category_id: ID_PATH_ANNOTATION,
    sql: Annotated[Session, Depends(get_sql)],
    data: CategoryUpdate,
) -> CategoryResponse:
    pass


@router.get("/{category_id}", summary="Get a category", operation_id="getCategory")
def endp_get_category(
    sql: Annotated[Session, Depends(get_sql)], category_id: ID_PATH_ANNOTATION
) -> CategoryResponse:
    pass
