from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field("Default", min_length=1, max_length=50)
    description: str | None = Field(None, min_length=1, max_length=100)
    course_id: int
    is_active: bool = True


class TaskCreate(TaskBase):
    pass


class TaskResponse(TaskBase):
    task_id: int
    model_config = ConfigDict(from_attributes=True)


class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=50)
    description: str | None = Field(None, min_length=1, max_length=100)
    course_id: int | None = None
    is_active: bool | None = None
