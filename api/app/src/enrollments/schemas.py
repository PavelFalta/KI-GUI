from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, date
# from ..courses.schemas import CourseResponse
# from ..users.schemas import UserResponse
from ..task_completions.schemas import TaskCompletionResponse


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
    enrollment_id: int

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


class EnrollmentResponseTasks(EnrollmentResponse):
    task_completions: list[TaskCompletionResponse] = []
    completed_tasks: int = 0
    total_tasks: int = 0

    model_config = ConfigDict(from_attributes=True)
