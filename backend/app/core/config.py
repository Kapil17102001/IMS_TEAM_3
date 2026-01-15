from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Production FastAPI Base"
    API_V1_STR: str = "/api/v1"
    
    # DATABASE
    # For this demo we use sqlite, but in production you'd use postgresql
    # Example: postgresql://user:password@postgresserver/db
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./sql_app.db"

    class Config:
        env_file = ".env"

settings = Settings()
