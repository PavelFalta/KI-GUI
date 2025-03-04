from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
# from ..courses.schemas import CourseResponse
# from ..users.schemas import UserResponse


class StudentCourseBase(BaseModel):
    student_id: int
    course_id: int
    assigned_by: int
    enrollment_date: datetime = Field(default_factory=datetime.now)
    feedback: str | None = Field(None, max_length=255)
    deadline: datetime | None = None
    is_active: bool = True


class StudentCourseCreate(StudentCourseBase):
    pass


class StudentCourseResponse(StudentCourseBase):
    id: int
    
    # student: UserResponse | None = None
    # course: CourseResponse | None = None
    # assigner: UserResponse | None = None

    model_config = ConfigDict(from_attributes=True)


class StudentCourseUpdate(BaseModel):
    student_id: int | None = None
    course_id: int | None = None
    assigned_by: int | None = None
    feedback: str | None = Field(None, max_length=255)
    deadline: datetime | None = None
    is_active: bool | None = None