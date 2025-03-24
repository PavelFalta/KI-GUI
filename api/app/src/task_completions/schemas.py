from pydantic import BaseModel, ConfigDict
from datetime import datetime


class TaskCompletionBase(BaseModel):
    enrollment_id: int
    task_id: int
    completed_at: datetime | None = None
    is_active: bool = True
    

class TaskCompletionCreate(TaskCompletionBase):
    pass


class TaskCompletionResponse(TaskCompletionBase):
    task_completion_id: int

    model_config = ConfigDict(from_attributes=True)


class TaskCompletionUpdate(BaseModel):
    enrollment_id: int | None = None
    task_id: int | None = None
    completed_at: datetime | None = None
    is_active: bool | None = None