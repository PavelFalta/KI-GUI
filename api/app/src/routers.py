from app.src.auth.controllers import get_current_user
from fastapi import APIRouter, Depends

from app.src.roles import routers as role_router
from app.src.tasks import routers as task_router
from app.src.categories import routers as category_router
from app.src.users import routers as user_router
from app.src.enrollments import routers as student_course_router
from app.src.courses import routers as course_router
from app.src.task_completions import routers as task_completion_router

router = APIRouter()

router.include_router(role_router.router)
router.include_router(user_router.router)


private_router = APIRouter(dependencies=[Depends(get_current_user)])


private_router.include_router(task_router.router)
private_router.include_router(category_router.router)
private_router.include_router(student_course_router.router)
private_router.include_router(course_router.router)
private_router.include_router(task_completion_router.router)

router.include_router(private_router)
