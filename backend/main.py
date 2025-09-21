from dotenv import load_dotenv
import os
import pathlib

# Explicitly find the .env file in the project root, which is one level above the 'backend' directory
project_root = pathlib.Path(__file__).parent.parent
dotenv_path = project_root / ".env"
load_dotenv(dotenv_path=dotenv_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, loads
from backend import database

app = FastAPI()

# CORS Middleware
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(loads.router)

@app.get('/')
def read_root():

    return {"message": "Welcome to TruckMitraAI API"}