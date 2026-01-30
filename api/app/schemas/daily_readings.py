"""Pydantic schemas for daily readings endpoints."""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class DailyReadingNoteCreate(BaseModel):
    """Request to create or update a daily reading note."""

    userId: int
    date: str
    notes: str


class DailyReadingNoteUpdate(BaseModel):
    """Request to update a daily reading note."""

    notes: str


class DailyReadingNoteResponse(BaseModel):
    """Daily reading note response."""

    id: int
    userId: int
    date: str
    notes: str
    createdAt: str
    updatedAt: str
