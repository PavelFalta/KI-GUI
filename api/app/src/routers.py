from fastapi import APIRouter

from app.src.statuses import routers as statuses_router
from app.src.roles import routers as role_router
from app.src.tasks import routers as task_router
from app.src.categories import routers as category_router
from app.src.users import routers as user_router
from app.src.students_tasks import routers as student_task_router
from app.src.courses import routers as course_router

router = APIRouter()


router.include_router(statuses_router.router)
router.include_router(task_router.router)
router.include_router(role_router.router)
router.include_router(category_router.router)
router.include_router(user_router.router)
router.include_router(student_task_router.router)
router.include_router(course_router.router)