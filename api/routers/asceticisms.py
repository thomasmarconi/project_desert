from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from prisma.models import Asceticism, UserAsceticism, AsceticismLog
from prisma.enums import TrackingType, AsceticismStatus
from ..db import db

router = APIRouter()

# --- Pydantic Models for Inputs ---

class AsceticismCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    icon: Optional[str] = None
    type: TrackingType = TrackingType.BOOLEAN
    metadata: Optional[dict] = None
    creatorId: Optional[int] = None
    
class UserAsceticismLink(BaseModel):
    userId: int
    asceticismId: int
    targetValue: Optional[float] = None
    metadata: Optional[dict] = None

class LogCreate(BaseModel):
    userAsceticismId: int
    date: str # ISO Date
    completed: bool = False
    value: Optional[float] = None
    notes: Optional[str] = None
    metadata: Optional[dict] = None

# --- Routes ---

@router.get("/asceticisms/", tags=["asceticisms"], response_model=List[Asceticism])
async def list_asceticisms(category: Optional[str] = None):
    """
    List all available asceticism templates (isTemplate=True).
    """
    where = {"isTemplate": True}
    if category:
        where["category"] = category
        
    return await db.asceticism.find_many(where=where)

@router.post("/asceticisms/", tags=["asceticisms"], response_model=Asceticism)
async def create_asceticism(item: AsceticismCreate):
    """
    Create a new asceticism. If creatorId is provided, it's a custom user asceticism.
    Otherwise it expects admin access (logic not implemented yet), defaulting to template.
    """
    is_template = item.creatorId is None
    
    # helper to filter out None values to let Prisma handle nulls/defaults gracefully
    data = {
        "title": item.title,
        "category": item.category,
        "type": item.type,
        "isTemplate": is_template,
    }
    
    if item.description is not None:
        data["description"] = item.description
    if item.icon is not None:
        data["icon"] = item.icon
    if item.metadata is not None:
        data["metadata"] = item.metadata
    if item.creatorId is not None:
        data["creatorId"] = item.creatorId
        
    return await db.asceticism.create(data=data)

@router.get("/asceticisms/my", tags=["asceticisms"], response_model=List[UserAsceticism])
async def list_user_asceticisms(user_id: int = Query(..., alias="userId")):
    """
    Get all active asceticisms for a specific user.
    """
    return await db.userasceticism.find_many(
        where={
            "userId": user_id,
            "status": AsceticismStatus.ACTIVE
        },
        include={
            "asceticism": True
        }
    )

@router.post("/asceticisms/join", tags=["asceticisms"], response_model=UserAsceticism)
async def join_asceticism(link: UserAsceticismLink):
    """
    Subscribe a user to an asceticism.
    """
    # Check if already joined?
    existing = await db.userasceticism.find_first(
        where={
            "userId": link.userId,
            "asceticismId": link.asceticismId,
            "status": AsceticismStatus.ACTIVE
        }
    )
    if existing:
        return existing
        
    # filter Nones & use Connect for relations
    data = {
        "user": {"connect": {"id": link.userId}},
        "asceticism": {"connect": {"id": link.asceticismId}}
    }
    if link.targetValue is not None:
        data["targetValue"] = link.targetValue
    if link.metadata is not None:
        data["metadata"] = link.metadata
        
    return await db.userasceticism.create(data=data)

@router.post("/asceticisms/log", tags=["asceticisms"], response_model=AsceticismLog)
async def log_daily_progress(log: LogCreate):
    """
    Log progress for a specific day. Upserts (updates if exists).
    """
    # Parse date appropriately if needed, but Prisma Python might handle ISO strings for DateTime
    # Note: Ensure the string is formatted as ISO-8601
    
    # Prepare update data (no relations needed here usually, just scalars)
    update_data = {
        "completed": log.completed
    }
    if log.value is not None: update_data["value"] = log.value
    if log.notes is not None: update_data["notes"] = log.notes
    if log.metadata is not None: update_data["metadata"] = log.metadata
    
    # Prepare create data (requires relation connection)
    create_data = {
        "userAsceticism": {"connect": {"id": log.userAsceticismId}},
        "date": log.date,
        "completed": log.completed,
    }
    if log.value is not None: create_data["value"] = log.value
    if log.notes is not None: create_data["notes"] = log.notes
    if log.metadata is not None: create_data["metadata"] = log.metadata
    
    return await db.asceticismlog.upsert(
        where={
            "userAsceticismId_date": {
                "userAsceticismId": log.userAsceticismId,
                "date": log.date # Expecting ISO string
            }
        },
        data={
            "create": create_data,
            "update": update_data
        }
    )

@router.get("/asceticisms/progress", tags=["asceticisms"])
async def get_user_progress(
    user_id: int = Query(..., alias="userId"),
    start_date: str = Query(..., alias="startDate"),
    end_date: str = Query(..., alias="endDate")
):
    """
    Get progress statistics for all user asceticisms within a date range.
    Returns completion rates, streaks, and detailed logs.
    """
    from datetime import datetime, timedelta
    
    # Get all active user asceticisms
    user_asceticisms = await db.userasceticism.find_many(
        where={
            "userId": user_id,
            "status": AsceticismStatus.ACTIVE
        },
        include={
            "asceticism": True,
            "logs": {
                "where": {
                    "date": {
                        "gte": start_date,
                        "lte": end_date
                    }
                },
                "order_by": {
                    "date": "asc"
                }
            }
        }
    )
    
    # Calculate statistics for each asceticism
    progress_data = []
    for ua in user_asceticisms:
        logs = ua.logs or []
        
        # Calculate total days in range
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        total_days = (end - start).days + 1
        
        # Calculate completion stats
        completed_days = sum(1 for log in logs if log.completed)
        completion_rate = (completed_days / total_days * 100) if total_days > 0 else 0
        
        # Calculate current streak
        current_streak = 0
        if logs:
            sorted_logs = sorted(logs, key=lambda x: x.date, reverse=True)
            for log in sorted_logs:
                if log.completed:
                    current_streak += 1
                else:
                    break
        
        # Calculate longest streak in period
        longest_streak = 0
        temp_streak = 0
        for log in sorted(logs, key=lambda x: x.date):
            if log.completed:
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                temp_streak = 0
        
        progress_data.append({
            "userAsceticismId": ua.id,
            "asceticism": {
                "id": ua.asceticism.id,
                "title": ua.asceticism.title,
                "category": ua.asceticism.category,
                "icon": ua.asceticism.icon,
                "type": ua.asceticism.type
            },
            "startDate": ua.startDate.isoformat(),
            "stats": {
                "totalDays": total_days,
                "completedDays": completed_days,
                "completionRate": round(completion_rate, 1),
                "currentStreak": current_streak,
                "longestStreak": longest_streak
            },
            "logs": [
                {
                    "date": log.date.isoformat(),
                    "completed": log.completed,
                    "value": log.value,
                    "notes": log.notes
                }
                for log in logs
            ]
        })
    
    return progress_data

@router.post("/debug/user")
async def create_debug_user(email: str):
    return await db.user.create(data={"email": email, "name": "Debug User"})
