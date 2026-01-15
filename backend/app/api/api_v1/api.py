from app.api.api_v1.endpoints import  interns
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(interns.router, prefix="/interns", tags=["interns"])

