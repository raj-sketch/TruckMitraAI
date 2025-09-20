
from fastapi import FastAPI
from backend.routers import auth, loads

app = FastAPI()

app.include_router(auth.router)
app.include_router(loads.router)

@app.get('/')
def read_root():
    return {"message": "Welcome to TRUCKMITRA_AI API"}
