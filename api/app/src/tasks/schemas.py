from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from ..statuses.schemas import StatusResponse
from ..categories.schemas import CategoryResponse
from ..users.schemas import UserResponse


class TaskBase(BaseModel):
    title: str = Field("Default", min_length=1, max_length=50)
    description: str | None = Field(None, min_length=1, max_length=100)
    category_id: int
    status_id: int
    creator_id: int | None = None
    is_active: bool = True


class TaskCreate(TaskBase):
    pass


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    created_at: datetime
    category_id: int
    status_id: int
    creator_id: int | None = None
    is_active: bool

    status: StatusResponse | None = None
    category: CategoryResponse | None = None
    creator: UserResponse | None = None

    model_config = ConfigDict(from_attributes=True)


class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=50)
    description: str | None = Field(None, min_length=1, max_length=100)
    category_id: int | None = None
    status_id: int | None = None
    is_active: bool | None = None
