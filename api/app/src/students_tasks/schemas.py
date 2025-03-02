from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


class StudentTaskBase(BaseModel):
    student_id: int
    task_id: int
    assigned_by: int
    status_id: int | None = None  # NOTE: opravu muze byt bez statusu

    enrollement_date: datetime = datetime.now()
    completed_at: datetime | None = None
    feedback: str | None = Field(None, max_length=255)
    deadline: datetime | None = None

    is_active: bool = True


class StudentTaskCreate(StudentTaskBase):
    pass


class StudentTaskResponse(StudentTaskBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class StudentTaskUpdate(BaseModel):
    student_id: int | None = None
    task_id: int | None = None
    assigned_by: int | None = None
    status_id: int | None = None

    completed_at: datetime | None = None
    feedback: str | None = Field(None, max_length=255)
    deadline: datetime | None = None

    is_active: bool | None = None
