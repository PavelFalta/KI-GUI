from pydantic import BaseModel, ConfigDict
from datetime import datetime


class CompletionBase(BaseModel):
    student_id: int
    task_id: int
    is_active: bool = False
    completed_at: datetime | None = None
    

class CompletionCreate(CompletionBase):
    pass


class CompletionResponse(CompletionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class CompletionUpdate(BaseModel):
    student_id: int | None = None
    task_id: int | None = None
    is_completed: bool | None = None
