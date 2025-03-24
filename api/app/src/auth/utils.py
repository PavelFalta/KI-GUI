from datetime import timedelta, datetime
import jwt

from app.config import settings


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode, settings.auth.secret_key, algorithm=settings.auth.algorithm
    )


def verify_password(plain_password, hashed_password):
    # FIXME: Zde je potřeba opravit ověření hesla. nemame zatím validoatr na hashování hesel
    return plain_password == hashed_password
    # return pwd_context.verify(plain_password, hashed_password)
