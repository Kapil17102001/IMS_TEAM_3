from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Production FastAPI Base"
    API_V1_STR: str = "/api/v1"
    
    # POSTGRES CONFIGURATION
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "app"
    POSTGRES_PORT: str = "5432"

    # EMAIL CONFIGURATION
    MAIL_USERNAME: str = "saini17102001@outlook.com"
    MAIL_PASSWORD: str = "rgouemvjrebifphi"
    MAIL_FROM: str = "saini17102001@outlook.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.office365.com"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True

    # MICROSOFT GRAPH CONFIGURATION
    GRAPH_CLIENT_ID: str = "ad7225fd-6e35-4d6d-9a6c-726ea235346f"  # Replace with valid Client ID
    GRAPH_TENANT_ID: str = "consumers"       # "consumers" for personal accounts, or Tenant ID for orgs
    GRAPH_USER_SCOPES: list[str] = ["Mail.Send"]

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


    class Config:
        env_file = ".env"

settings = Settings()

