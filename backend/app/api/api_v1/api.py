from app.api.api_v1.endpoints import  interns
from app.api.api_v1.endpoints import user
from app.api.api_v1.endpoints import task
from app.api.api_v1.endpoints import task_assignment
from app.api.api_v1.endpoints import candidate
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(interns.router, prefix="/interns", tags=["interns"])
api_router.include_router(user.router,prefix="/users",tags=["users"])
api_router.include_router(task.router,prefix="/tasks",tags=["tasks"])
api_router.include_router(candidate.router,prefix="/candidate",tags=["candidate"])
api_router.include_router(task_assignment.router,prefix="/task_assignment",tags=["task_assignment"])