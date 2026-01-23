from fastapi import APIRouter, HTTPException, Depends
from datetime import timedelta
from app.services.user_service import create_access_token, decode_access_token, verify_password, get_password_hash
from app.models.user import User
from app.models.intern import Intern  # Import Intern model
from app.models.college import College  # Import College model
from app.db.session import SessionLocal
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Generator
from app.models.user import UserRole  # Import UserRole enum

router = APIRouter()

# Token expiration time
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Pydantic models for request and response
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str  # New field for user role

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    user_id: int
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

@router.post("/register", response_model=Token)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Endpoint to register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Validate role
    try:
        role = UserRole(user.role.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")

    # If role is intern, get intern_id from intern table
    intern_id = None
    if role == UserRole.INTERN:
        intern = db.query(Intern).filter(Intern.email == user.email).first()
        if not intern:
            raise HTTPException(status_code=400, detail="Email not found in intern records. Please contact admin.")
        intern_id = intern.id

    # If role is college, get college_id from college table
    college_id = None
    if role == UserRole.COLLEGE:
        college = db.query(College).filter(College.email == user.email).first()
        if not college:
            raise HTTPException(status_code=400, detail="Email not found in college records. Please contact admin.")
        college_id = college.id

    # Hash the password
    hashed_password = get_password_hash(user.password)

    # Create new user
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=role,  # Assign validated role
        intern_id=intern_id,  # Assign intern_id if role is intern
        college_id=college_id  # Assign college_id if role is college
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": new_user.username,
        "user_id": new_user.id,
        "role":new_user.role
    }

@router.post("/login", response_model=Token)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """Endpoint to login a user."""
    # Check if user exists
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Generate token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "user_id": user.id,
        "role": user.role
    }

@router.post("/logout")
def logout_user():
    """Endpoint to logout a user."""
    # Invalidate token (this can be implemented with a token blacklist or similar mechanism)
    return {"message": "User logged out successfully"}