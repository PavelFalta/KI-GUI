from pydantic import BaseModel, ConfigDict, Field


class StatusBase(BaseModel):
    name: str = Field("Default", min_length=1, max_length=50)
    description: str | None = Field(None, min_length=1, max_length=100)


class StatusCreate(StatusBase):
    pass


class StatusResponse(StatusBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class StatusUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
