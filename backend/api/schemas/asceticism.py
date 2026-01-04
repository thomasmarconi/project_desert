from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

# Vice Schemas
class ViceBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None

class ViceCreate(ViceBase):
    pass

class ViceRead(ViceBase):
    id: uuid.UUID
    
    class Config:
        from_attributes = True

# Asceticism Log Schemas
class AsceticismLogBase(BaseModel):
    date: datetime
    completed: bool = False
    notes: Optional[str] = None
    viceId: Optional[uuid.UUID] = None

class AsceticismLogCreate(AsceticismLogBase):
    pass

class AsceticismLogRead(AsceticismLogBase):
    id: uuid.UUID
    userId: uuid.UUID
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True
