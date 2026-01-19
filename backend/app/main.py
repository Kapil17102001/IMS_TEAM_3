from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_v1.api import api_router
from app.db.base_class import Base
from app.db.session import engine
from app.core.logger import logger
import os

# Create tables for demo purpose. In production, use Alembic migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:5173"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.on_event("startup")
async def startup_event():
    """Check email authentication on startup"""
    token_cache_path = "token_cache.bin"
    
    if not os.path.exists(token_cache_path):
        logger.warning("="*70)
        logger.warning("EMAIL SERVICE NOT AUTHENTICATED!")
        logger.warning("="*70)
        logger.warning("Email functionality will not work until you authenticate.")
        logger.warning("Please run: python authenticate_email.py")
        logger.warning("="*70)
        print("\n WARNING: Email service not authenticated!")
        print("   Run 'python authenticate_email.py' to enable email functionality.\n")
    else:
        logger.info("Email service token cache found")

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def root():
    return {"message": "Welcome to the Intern Management System ",
    "status":"good"}
