"""Main FastAPI application entry point for Project Desert API.

Configures CORS, database connections, and includes all routers.
"""

from contextlib import asynccontextmanager
from dotenv import load_dotenv


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import db
from .routers import asceticisms, admin, packages, daily_readings

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage database lifecycle during application startup and shutdown.

    Connects to Prisma database on startup and disconnects on shutdown.
    """
    await db.connect()
    yield
    await db.disconnect()


app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(asceticisms.router)
app.include_router(admin.router)
app.include_router(packages.router)
app.include_router(daily_readings.router)


@app.get("/")
async def root():
    """Health Message"""
    return {"message": "Hello Project Desert API!"}
