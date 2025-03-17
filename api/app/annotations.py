from typing import Annotated

from fastapi import Path

ID_PATH_ANNOTATION = Annotated[
    int,
    Path(
        title="ID",
        description="ID of the resource",
        example=1,
        ge=1,
        le=9223372036854775807,  # 8 bytes int max value
    ),
]
