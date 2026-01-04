from typing import List, Optional
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from prisma.models import User
from prisma.enums import UserRole
from ..db import db

router = APIRouter(prefix="/admin", tags=["admin"])

# --- Pydantic Models ---

class UserResponse(BaseModel):
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
    userId: int
    newRole: str

class ToggleBanRequest(BaseModel):
    userId: int
    isBanned: bool

class CurrentUserResponse(BaseModel):
    id: int
    name: Optional[str]
    email: Optional[str]
    role: str
    isBanned: bool

# --- Helper Functions ---

async def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email"""
    return await db.user.find_unique(where={"email": email})

async def require_admin(user_email: Optional[str]) -> User:
    """Verify that the user is an admin"""
    if not user_email:
        raise HTTPException(status_code=401, detail="Unauthorized: Not logged in")
    
    user = await get_user_by_email(user_email)
    
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized: User not found")
    
    if user.isBanned:
        raise HTTPException(status_code=403, detail="Unauthorized: User is banned")
    
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized: Admin access required")
    
    return user

# --- Routes ---

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(x_user_email: Optional[str] = Header(None)):
    """
    Get all users with their details and activity counts.
    Requires admin authentication.
    """
    await require_admin(x_user_email)
    
    users = await db.user.find_many(
        order={
            "role": "desc"
        }
    )
    
    # Manually count relations for each user
    result = []
    for user in users:
        # Count user asceticisms
        asceticisms_count = await db.userasceticism.count(
            where={"userId": user.id}
        )
        
        # Count group memberships
        groups_count = await db.groupmember.count(
            where={"userId": user.id}
        )
        
        result.append(
            UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                image=user.image,
                role=user.role,
                isBanned=user.isBanned,
                emailVerified=user.emailVerified.isoformat() if user.emailVerified else None,
                userAsceticismsCount=asceticisms_count,
                groupMembersCount=groups_count
            )
        )
    
    return result

@router.post("/users/role")
async def update_user_role(
    request: UpdateRoleRequest,
    x_user_email: Optional[str] = Header(None)
):
    """
    Update a user's role.
    Prevents admins from demoting themselves.
    """
    current_user = await require_admin(x_user_email)
    
    # Prevent users from demoting themselves
    if current_user.id == request.userId and request.newRole != UserRole.ADMIN:
        raise HTTPException(
            status_code=400,
            detail="You cannot change your own admin role"
        )
    
    # Validate role
    try:
        new_role = UserRole(request.newRole)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    await db.user.update(
        where={"id": request.userId},
        data={"role": new_role}
    )
    
    return {"success": True}

@router.post("/users/ban")
async def toggle_user_ban(
    request: ToggleBanRequest,
    x_user_email: Optional[str] = Header(None)
):
    """
    Ban or unban a user.
    Prevents admins from banning themselves.
    """
    current_user = await require_admin(x_user_email)
    
    # Prevent users from banning themselves
    if current_user.id == request.userId:
        raise HTTPException(
            status_code=400,
            detail="You cannot ban yourself"
        )
    
    await db.user.update(
        where={"id": request.userId},
        data={"isBanned": request.isBanned}
    )
    
    return {"success": True}

@router.get("/current-user", response_model=CurrentUserResponse)
async def get_current_user(x_user_email: Optional[str] = Header(None)):
    """
    Get current user info including role and ban status.
    """
    if not x_user_email:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    user = await get_user_by_email(x_user_email)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return CurrentUserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        isBanned=user.isBanned
    )
