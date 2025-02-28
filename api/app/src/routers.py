from fastapi import APIRouter

from app.src.statuses import routers as statuses_router
from app.src.roles import routers as role_router

router = APIRouter()


router.include_router(statuses_router.router)

router.include_router(role_router.router)
