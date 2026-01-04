from fastapi import Depends
from fastapi_users import FastAPIUsers
from uuid import UUID

from backend.api.db import db
from backend.api.auth.adapter import PrismaUserDatabase
from backend.api.auth.manager import UserManager
from backend.api.auth.config import auth_backend
from prisma.models import User

async def get_user_db():
    yield PrismaUserDatabase(User, db)

async def get_user_manager(user_db: PrismaUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)

fastapi_users = FastAPIUsers[User, UUID](
    get_user_manager,
    [auth_backend],
)

current_active_user = fastapi_users.current_user(active=True)
