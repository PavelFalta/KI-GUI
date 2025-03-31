from pydantic import BaseModel, ConfigDict, Field
# from ..categories.schemas import CategoryResponse
# from ..users.schemas import UserResponse


class CourseBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=50)
    description: str | None = Field(None, max_length=100)
    category_id: int
    teacher_id: int
    deadline_in_days: int | None
    is_active: bool = True


class CourseCreate(CourseBase):
    pass


class CourseResponse(CourseBase):
    course_id: int
    # category: CategoryResponse | None = None
    # teacher: UserResponse | None = None

    model_config = ConfigDict(from_attributes=True)


class CourseUpdate(BaseModel):
    title: str | None = Field(None, min_length=3, max_length=50)
    description: str | None = Field(None, max_length=100)
    category_id: int | None = None
    teacher_id: int | None = None
    deadline_in_days: int | None = None
    is_active: bool | None = None