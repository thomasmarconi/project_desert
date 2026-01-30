"""Pydantic schemas for admin endpoints."""

from typing import Optional
from pydantic import BaseModel


class UserResponse(BaseModel):
    """User response with activity counts."""

    id: int
    name: Optional[str]
    email: Optional[str]
    image: Optional[str]
    role: str
    isBanned: bool
    emailVerified: Optional[str]
    userAsceticismsCount: int
    groupMembersCount: int


class UpdateRoleRequest(BaseModel):
    """Request to update user role."""

    userId: int
    newRole: str


class ToggleBanRequest(BaseModel):
    """Request to ban or unban a user."""

    userId: int
    isBanned: bool


class CurrentUserResponse(BaseModel):
    """Current user information."""

    id: int
    name: Optional[str]
    email: Optional[str]
    role: str
    isBanned: bool
