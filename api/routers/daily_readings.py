from typing import Optional
from datetime import datetime, timezone
import httpx
import re
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from prisma import Json
from prisma.models import DailyReadingNote
from ..db import db

router = APIRouter(prefix="/daily-readings", tags=["daily-readings"])

# --- Pydantic Models ---


class DailyReadingNoteCreate(BaseModel):
    userId: int
    date: str  # ISO Date string (YYYY-MM-DD)
    notes: str


class DailyReadingNoteUpdate(BaseModel):
    notes: str


# --- Routes ---


@router.get("/readings/{date}")
async def get_mass_readings(date: str):
    """
    Get Mass readings for a specific date. Checks database cache first,
    then fetches from Universalis API if not cached.
    Date should be in YYYYMMDD format (e.g., 20260105).
    """
    try:
        # Parse date string to datetime (YYYYMMDD -> datetime)
        year = int(date[:4])
        month = int(date[4:6])
        day = int(date[6:8])
        date_obj = datetime(year, month, day, tzinfo=timezone.utc)

        # Check if readings exist in database
        cached_reading = await db.massreading.find_unique(where={"date": date_obj})

        if cached_reading:
            # Return cached readings from database
            return cached_reading.data

        # Not in cache, fetch from Universalis API
        url = f"https://www.universalis.com/{date}/jsonpmass.js"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()

            # Get the JSONP response
            body = response.text

            # Strip JSONP wrapper: universalisCallback(...);
            json_str = re.sub(r"^universalisCallback\(", "", body)
            json_str = re.sub(r"\);\s*$", "", json_str)

            # Parse the JSON
            data = json.loads(json_str)

            # Store in database for future requests (wrap data in Json type)
            await db.massreading.create(data={"date": date_obj, "data": Json(data)})

            return data

    except ValueError as e:
        raise HTTPException(
            status_code=400, detail=f"Invalid date format: {str(e)}"
        ) from e
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=502, detail=f"Failed to fetch readings: {str(e)}"
        ) from e
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=502, detail=f"Failed to parse readings: {str(e)}"
        ) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/notes", response_model=dict)
async def create_or_update_note(data: DailyReadingNoteCreate):
    """
    Create or update a daily reading note for a user on a specific date.
    """
    try:
        # Parse the date string and normalize to midnight UTC
        date_obj = datetime.fromisoformat(data.date.replace("Z", "+00:00"))
        normalized_date = date_obj.replace(
            hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
        )

        # Check if a note already exists for this user and date
        existing_note = await db.dailyreadingnote.find_first(
            where={"userId": data.userId, "date": normalized_date}
        )

        if existing_note:
            # Update existing note
            updated_note = await db.dailyreadingnote.update(
                where={"id": existing_note.id}, data={"notes": data.notes}
            )
            return {
                "id": updated_note.id,
                "userId": updated_note.userId,
                "date": updated_note.date.isoformat(),
                "notes": updated_note.notes,
                "createdAt": updated_note.createdAt.isoformat(),
                "updatedAt": updated_note.updatedAt.isoformat(),
            }
        else:
            # Create new note
            new_note = await db.dailyreadingnote.create(
                data={
                    "userId": data.userId,
                    "date": normalized_date,
                    "notes": data.notes,
                }
            )
            return {
                "id": new_note.id,
                "userId": new_note.userId,
                "date": new_note.date.isoformat(),
                "notes": new_note.notes,
                "createdAt": new_note.createdAt.isoformat(),
                "updatedAt": new_note.updatedAt.isoformat(),
            }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/notes/{user_id}/{date}", response_model=dict)
async def get_note_by_date(user_id: int, date: str):
    """
    Get a user's daily reading note for a specific date.
    Returns 404 if no note exists for that date.
    """
    try:
        # Parse and normalize the date
        date_obj = datetime.fromisoformat(date.replace("Z", "+00:00"))
        normalized_date = date_obj.replace(
            hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
        )

        note = await db.dailyreadingnote.find_first(
            where={"userId": user_id, "date": normalized_date}
        )

        if not note:
            raise HTTPException(status_code=404, detail="No note found for this date")

        return {
            "id": note.id,
            "userId": note.userId,
            "date": note.date.isoformat(),
            "notes": note.notes,
            "createdAt": note.createdAt.isoformat(),
            "updatedAt": note.updatedAt.isoformat(),
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/notes/{user_id}", response_model=list)
async def get_all_user_notes(user_id: int, limit: Optional[int] = 30):
    """
    Get all daily reading notes for a user, ordered by date descending.
    """
    try:
        notes = await db.dailyreadingnote.find_many(
            where={"userId": user_id},
            order={"date": "desc"},
            take=limit,
        )

        return [
            {
                "id": note.id,
                "userId": note.userId,
                "date": note.date.isoformat(),
                "notes": note.notes,
                "createdAt": note.createdAt.isoformat(),
                "updatedAt": note.updatedAt.isoformat(),
            }
            for note in notes
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/notes/{note_id}")
async def delete_note(note_id: int):
    """
    Delete a daily reading note by ID.
    """
    try:
        note = await db.dailyreadingnote.find_unique(where={"id": note_id})

        if not note:
            raise HTTPException(status_code=404, detail="Note not found")

        await db.dailyreadingnote.delete(where={"id": note_id})

        return {"message": "Note deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
