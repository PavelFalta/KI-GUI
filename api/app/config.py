from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class AuthSettings(BaseModel):
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int


class SqlSettings(BaseModel):
    name: str

    def get_url(self):
        return f"sqlite:///{self.name}.db"


class Settings(BaseSettings):
    sql: SqlSettings
    auth: AuthSettings

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_nested_delimiter="__",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
