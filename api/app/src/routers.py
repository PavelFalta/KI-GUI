from fastapi import APIRouter

from app.src.statuses import routers as statuses_router

router = APIRouter()


router.include_router(statuses_router.router)
