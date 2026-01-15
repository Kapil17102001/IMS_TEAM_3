from fastapi import FastAPI
from app.core.config import settings
from app.api.api_v1.api import api_router
from app.db.base_class import Base
from app.db.session import engine

# Create tables for demo purpose. In production, use Alembic migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to the Production FastAPI Base Data"}
