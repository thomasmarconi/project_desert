"""Main FastAPI application entry point for Project Desert API.

Configures CORS, database connections, and includes all routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import asceticisms, admin, packages, daily_readings

app = FastAPI(
    title="Project Desert API",
    description="API for managing ascetical practices and spiritual growth",
    version="2.0.0",
)

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
    """Health check endpoint."""
    return {"message": "Hello Project Desert API!", "version": "2.0.0"}
