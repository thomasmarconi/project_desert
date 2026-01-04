from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from backend.api.db import db
from backend.api.schemas.asceticism import AsceticismLogCreate, AsceticismLogRead
from backend.api.auth.dependencies import current_active_user
from backend.api.auth.schemas import UserRead

router = APIRouter()

@router.post("/", response_model=AsceticismLogRead)
async def create_log(
    log: AsceticismLogCreate,
    user: UserRead = Depends(current_active_user)
):
    log_data = log.model_dump()
    # Ensure foreign keys are strings if UUIDs
    if log_data.get('viceId'):
        log_data['viceId'] = str(log_data['viceId'])
        
    created_log = await db.asceticismlog.create(
        data={
            **log_data,
            'userId': str(user.id)
        }
    )
    return created_log

@router.get("/", response_model=List[AsceticismLogRead])
async def get_logs(
    user: UserRead = Depends(current_active_user),
    vice_id: Optional[UUID] = None
):
    where_clause = {'userId': str(user.id)}
    if vice_id:
        where_clause['viceId'] = str(vice_id)
        
    logs = await db.asceticismlog.find_many(
        where=where_clause,
        order={'date': 'desc'}
    )
    return logs
