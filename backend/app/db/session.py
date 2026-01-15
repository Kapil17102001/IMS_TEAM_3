from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.logger import logger

try:
    logger.info("Attempting to connect to database...")
    #logger.debug(f"Database URI: {settings.SQLALCHEMY_DATABASE_URI}")
    
    engine = create_engine(
        settings.SQLALCHEMY_DATABASE_URI,
        # Force the session timezone at the driver level
        connect_args={
            "options": "-c timezone=Asia/Kolkata"
        }
    )
    logger.info("Database engine created successfully")

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("SessionLocal configured successfully")

except Exception as e:
    logger.error(f"Error connecting to database: {e}", exc_info=True)
    raise


