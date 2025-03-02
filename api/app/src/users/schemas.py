from pydantic import BaseModel, Field


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=5, max_length=50)

    contact_number: str | None = Field(None, min_length=9, max_length=15)

    role_id: int
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=50)


class UserResponse(UserBase):
    id: int


class UserUpdate(BaseModel):
    username: str | None = Field(None, min_length=3, max_length=50)
    first_name: str | None = Field(None, min_length=1, max_length=50)
    last_name: str | None = Field(None, min_length=1, max_length=50)
    email: str | None = Field(None, min_length=5, max_length=50)

    contact_number: str | None = Field(None, min_length=9, max_length=15)

    role_id: int | None = None
    is_active: bool | None = None
    password: str | None = Field(None, min_length=6, max_length=50)
