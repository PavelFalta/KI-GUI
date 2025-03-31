from app.src.task_completions.schemas import TaskCompletionResponse
from app.src.courses.schemas import CourseResponse
from app.src.roles.schemas import RoleResponse
from app.src.enrollments.schemas import EnrollmentResponse
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: EmailStr = Field(..., min_length=5, max_length=50)
    is_active: bool = True


class UserCreate(UserBase):
    role_id: int
    password_hash: str = Field(..., min_length=6, max_length=50)


class UserResponse(UserBase):
    user_id: int

    role: RoleResponse

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    username: str | None = Field(None, min_length=3, max_length=50)
    first_name: str | None = Field(None, min_length=1, max_length=50)
    last_name: str | None = Field(None, min_length=1, max_length=50)
    email: EmailStr | None = Field(None, min_length=5, max_length=50)
    role_id: int | None = None
    is_active: bool | None = None
    password_hash: str = Field(..., min_length=6, max_length=50)


class UserResponseTasksAndCourses(UserResponse):
    created_courses: list[CourseResponse] = []
    enrolled_courses: list[EnrollmentResponse] = []
    assigned_courses: list[EnrollmentResponse] = []
    task_completions: list[TaskCompletionResponse] = []

    model_config = ConfigDict(from_attributes=True)
