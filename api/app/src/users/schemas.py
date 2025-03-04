from app.src.completion.schemas import CompletionResponse

from app.src.courses.schemas import CourseResponse
from app.src.roles.schemas import RoleResponse

from app.src.students_courses.schemas import StudentCourseResponse
from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=5, max_length=50)

    contact_number: str | None = Field(None, min_length=9, max_length=15)

    is_active: bool = True


class UserCreate(UserBase):
    role_id: int

    password: str = Field(..., min_length=6, max_length=50)


class UserResponse(UserBase):
    id: int

    role: RoleResponse

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    username: str | None = Field(None, min_length=3, max_length=50)
    first_name: str | None = Field(None, min_length=1, max_length=50)
    last_name: str | None = Field(None, min_length=1, max_length=50)
    email: str | None = Field(None, min_length=5, max_length=50)

    contact_number: str | None = Field(None, min_length=9, max_length=15)

    role_id: int | None = None
    is_active: bool | None = None
    password: str | None = Field(None, min_length=6, max_length=50)


class UserResponseTasksAndCourses(UserResponse):
    created_courses: list[CourseResponse] = []
    enrolled_courses: list[StudentCourseResponse] = []
    assigned_courses: list[StudentCourseResponse] = []
    task_completions: list[CompletionResponse] = []

    model_config = ConfigDict(from_attributes=True)
