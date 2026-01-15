# Production FastAPI Backend Base

This is a production-ready backend structure built with FastAPI, SQLAlchemy, and Pydantic.

## Project Structure

- **app**: Main application source code.
  - **api**: API endpoints and dependency injection.
  - **core**: Configuration and core settings.
  - **db**: Database configuration and session management.
  - **models**: SQLAlchemy database models.
  - **schemas**: Pydantic schemas for data validation.
  - **services**: Business logic layer (Service Pattern).
- **requirements.txt**: Project dependencies.

## Setup & Running

1. **Install Dependencies**:
   It is recommended to use a virtual environment.
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Copy the example environment file.
   ```bash
   cp .env.example .env
   ```
   (Or rename it manually). The default settings use SQLite, so no extra DB setup is needed for the demo.

3. **Run the Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Access API**:
   - Interactive Docs: http://localhost:8000/docs
   - Demo Endpoint: http://localhost:8000/api/v1/demo/items/

## Features

- **Scalable Structure**: Separated concerns (Models, Schemas, Services, API).
- **Service Layer**: Business logic is decoupled from API routes.
- **Dependency Injection**: Database sessions managed via FastAPI dependencies.
- **Configuration**: Type-safe settings using Pydantic Settings.
