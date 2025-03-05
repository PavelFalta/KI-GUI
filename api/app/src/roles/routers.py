from typing import Annotated

from app.annotations import ID_PATH_ANNOTATION
from app.src.roles.controllers import (
    create_role,
    delete_role,
    get_role,
    update_role,
    get_roles,
)
from app.src.roles.schemas import RoleCreate, RoleResponse, RoleUpdate
from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_sql

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("", summary="Get all roles", operation_id="getRoles")
def endp_get_roles(
    sql: Annotated[Session, Depends(get_sql)],
) -> list[RoleResponse]:
    return get_roles(sql=sql)


@router.post("", summary="Create a role", operation_id="createRoles")
def endp_create_role(
    sql: Annotated[Session, Depends(get_sql)], data: RoleCreate
) -> RoleResponse:
    return create_role(sql=sql, data=data)


@router.put("/{role_id}", summary="Update a role", operation_id="updateRole")
def endp_update_role(
    role_id: ID_PATH_ANNOTATION,
    sql: Annotated[Session, Depends(get_sql)],
    data: RoleUpdate,
) -> RoleResponse:
    return update_role(sql=sql, data=data, role_id=role_id)


@router.get("/{role_id}", summary="Get a role", operation_id="getRole")
def endp_get_role(
    sql: Annotated[Session, Depends(get_sql)], role_id: ID_PATH_ANNOTATION
) -> RoleResponse:
    return get_role(sql=sql, role_id=role_id)


@router.delete("/{role_id}", summary="Delete a role", operation_id="deleteRole", status_code=204)
def endp_delete_role(
    role_id: ID_PATH_ANNOTATION, sql: Annotated[Session, Depends(get_sql)]
) -> None:
    return delete_role(sql=sql, role_id=role_id)
