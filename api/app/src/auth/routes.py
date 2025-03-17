from typing import Annotated
from app.src.auth.schemas import Token
from app.src.users.schemas import UserResponse
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_sql
from passlib.context import CryptContext  # Pro hashování hesel
from app.src.auth.controllers import (
    get_access_token,
    get_current_user,
)

router = APIRouter(tags=["Auth"], prefix="/auth")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")  # Hashovací context


@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    sql: Annotated[Session, Depends(get_sql)],
) -> Token:
    return get_access_token(sql, form_data.username, form_data.password)


@router.get("/users/me")
async def read_users_me(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
) -> UserResponse:
    return current_user
