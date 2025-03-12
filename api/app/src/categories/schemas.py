from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    description: str | None = Field(None, max_length=100)
    is_active: bool = True


class CategoryResponse(CategoryBase):
    category_id: int

    model_config = ConfigDict(from_attributes=True)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=3, max_length=50)
    description: str | None = Field(None, max_length=100)
    is_active: bool | None = None
