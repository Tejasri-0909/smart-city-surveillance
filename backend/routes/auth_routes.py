from fastapi import APIRouter
from utils.jwt_handler import create_access_token
from database import users_collection
from fastapi import APIRouter
import bcrypt

router = APIRouter()

@router.post("/login")
def login(username: str):
    token = create_access_token({"user": username})
    return {"access_token": token}

@router.post("/register")
def register_user(username: str, password: str, role: str):

    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    user = {
        "username": username,
        "password": hashed_password,
        "role": role
    }

    users_collection.insert_one(user)

    return {"message": "User registered successfully"}