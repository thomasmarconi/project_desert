from fastapi import APIRouter, Depends, HTTPException
from typing import List
from prisma.models import Vice
from backend.api.db import db
from backend.api.schemas.asceticism import ViceCreate, ViceRead
from backend.api.auth.dependencies import current_active_user
from backend.api.auth.schemas import UserRead

router = APIRouter()

@router.post("/", response_model=ViceRead)
async def create_vice(
    vice: ViceCreate,
    user: UserRead = Depends(current_active_user)
):
    vice_data = vice.model_dump()
    new_vice = await db.vice.create(data=vice_data)
    return new_vice

@router.get("/", response_model=List[ViceRead])
async def get_vices(
    user: UserRead = Depends(current_active_user)
):
    vices = await db.vice.find_many()
    return vices
