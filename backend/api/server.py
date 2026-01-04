# server.py -- main file for the API server

from contextlib import asynccontextmanager
from fastapi import FastAPI
from backend.api.db import connect_db, disconnect_db
from backend.api.auth.dependencies import fastapi_users, auth_backend
from backend.api.auth.schemas import UserRead, UserCreate, UserUpdate

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()

app = FastAPI(lifespan=lifespan)

# Auth Routes
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

# API Routes
from backend.api.routers import tracking, vices

app.include_router(
    tracking.router,
    prefix="/tracking",
    tags=["tracking"],
)

app.include_router(
    vices.router,
    prefix="/vices",
    tags=["vices"],
)

from backend.api.routers import websockets
app.include_router(websockets.router, tags=["websockets"])