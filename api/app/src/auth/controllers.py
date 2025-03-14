from datetime import timedelta
from typing import Annotated
from app.src.auth.schemas import Token
from app.src.auth.utils import create_access_token, verify_password
from app.src.users.schemas import UserResponse
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from sqlalchemy import select
from app import models
from app.database import get_sql
from app.config import settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def authenticate_user(sql: Session, username: str, password: str) -> None | models.User:
    user: models.User | None = sql.execute(
        select(models.User).where(models.User.username == username)
    ).scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    sql: Annotated[Session, Depends(get_sql)],
) -> UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.auth.secret_key, algorithms=[settings.auth.algorithm]
        )
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError as e:
        raise credentials_exception from e

    user: models.User | None = sql.execute(
        select(models.User).where(models.User.username == username)
    ).scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return UserResponse.model_validate(user)


def get_access_token(sql, username, password):
    user: None | models.User = authenticate_user(
        sql, username, password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.auth.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")