from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, date
# from ..courses.schemas import CourseResponse
# from ..users.schemas import UserResponse


class EnrollmentBase(BaseModel):
    student_id: int
    course_id: int
    assigner_id: int
    completed_at: datetime | None = None
    enrolled_at: date = Field(default_factory=lambda: date.today())
    deadline: date | None = None
    is_active: bool = True


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentResponse(EnrollmentBase):
    id: int
    
    # student: UserResponse | None = None
    # course: CourseResponse | None = None
    # assigner: UserResponse | None = None

    model_config = ConfigDict(from_attributes=True)


class EnrollmentUpdate(BaseModel):
    student_id: int | None = None
    course_id: int | None = None
    assigner_id: int | None = None
    completed_at: datetime | None = None
    deadline: date | None = None
    is_active: bool | None = None

