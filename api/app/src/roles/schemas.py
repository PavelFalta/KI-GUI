from pydantic import BaseModel, ConfigDict, Field


class RoleBase(BaseModel):
    name: str = Field("Default", min_length=1, max_length=50)
    description: str | None = Field(None, min_length=1, max_length=100)


class RoleCreate(RoleBase):
    pass


class RoleResponse(RoleBase):
    role_id: int

    model_config = ConfigDict(from_attributes=True)


class RoleUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=50)
    description: str | None = Field(None, min_length=1, max_length=100)
