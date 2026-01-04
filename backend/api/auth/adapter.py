from typing import Optional, Type, Generic
from uuid import UUID

from fastapi_users.db import BaseUserDatabase
from fastapi_users.models import ID
from pydantic import BaseModel

from prisma import Prisma
from prisma.models import User as PrismaUser

class PrismaUserDatabase(BaseUserDatabase[PrismaUser, UUID]):
    def __init__(self, user_model: Type[PrismaUser], db: Prisma):
        super().__init__(user_model)
        self.db = db

    async def get(self, id: UUID) -> Optional[PrismaUser]:
        return await self.db.user.find_unique(where={"id": str(id)})

    async def get_by_email(self, email: str) -> Optional[PrismaUser]:
        return await self.db.user.find_unique(where={"email": email})

    async def get_by_oauth_account(self, oauth: str, account_id: str) -> Optional[PrismaUser]:
        # Not implemented for Phase 1 MVP
        return None

    async def create(self, create_dict: dict) -> PrismaUser:
        user = await self.db.user.create(data=create_dict)
        return user

    async def update(self, user: PrismaUser, update_dict: dict) -> PrismaUser:
        updated_user = await self.db.user.update(
            where={"id": user.id}, data=update_dict
        )
        return updated_user

    async def delete(self, user: PrismaUser) -> None:
        await self.db.user.delete(where={"id": user.id})
