"""SQLModel models for Project Desert database schema."""

from datetime import datetime
from typing import Optional
from enum import Enum
from sqlmodel import Field, SQLModel, Relationship, Column, JSON
from sqlalchemy import BigInteger


# --- Enums ---


class UserRole(str, Enum):
    """User role enumeration."""

    USER = "USER"
    MODERATOR = "MODERATOR"
    ADMIN = "ADMIN"


class TrackingType(str, Enum):
    """Tracking type enumeration for asceticisms."""

    BOOLEAN = "BOOLEAN"
    NUMERIC = "NUMERIC"
    TEXT = "TEXT"


class AsceticismStatus(str, Enum):
    """Status of a user's asceticism commitment."""

    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"


class GroupRole(str, Enum):
    """Role within a group."""

    MEMBER = "MEMBER"
    ADMIN = "ADMIN"
    MENTOR = "MENTOR"


# --- Auth Models ---


class VerificationToken(SQLModel, table=True):
    """Verification token for authentication."""

    __tablename__ = "verification_token"

    identifier: str = Field(primary_key=True)
    token: str = Field(primary_key=True)
    expires: datetime


class Account(SQLModel, table=True):
    """OAuth account linked to a user."""

    __tablename__ = "accounts"

    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="users.id", ondelete="CASCADE")
    type: str = Field(max_length=255)
    provider: str = Field(max_length=255)
    providerAccountId: str = Field(max_length=255)
    refresh_token: Optional[str] = None
    access_token: Optional[str] = None
    expires_at: Optional[int] = Field(default=None, sa_column=Column(BigInteger))
    id_token: Optional[str] = None
    scope: Optional[str] = None
    session_state: Optional[str] = None
    token_type: Optional[str] = None

    # Relationships
    user: "User" = Relationship(back_populates="accounts")


class Session(SQLModel, table=True):
    """User session."""

    __tablename__ = "sessions"

    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="users.id", ondelete="CASCADE")
    expires: datetime
    sessionToken: str = Field(unique=True, max_length=255)

    # Relationships
    user: "User" = Relationship(back_populates="sessions")


class User(SQLModel, table=True):
    """User account."""

    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: Optional[str] = Field(default=None, max_length=255)
    email: Optional[str] = Field(default=None, unique=True, max_length=255)
    emailVerified: Optional[datetime] = None
    image: Optional[str] = None
    role: UserRole = Field(default=UserRole.USER)
    isBanned: bool = Field(default=False)

    # Relationships
    accounts: list["Account"] = Relationship(back_populates="user")
    sessions: list["Session"] = Relationship(back_populates="user")
    createdAsceticisms: list["Asceticism"] = Relationship(back_populates="creator")
    userAsceticisms: list["UserAsceticism"] = Relationship(back_populates="user")
    userPrograms: list["UserProgram"] = Relationship(back_populates="user")
    groupMembers: list["GroupMember"] = Relationship(back_populates="user")
    dailyReadingNotes: list["DailyReadingNote"] = Relationship(back_populates="user")


# --- Asceticism Models ---


class Asceticism(SQLModel, table=True):
    """Asceticism template or definition."""

    __tablename__ = "Asceticism"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    category: str
    icon: Optional[str] = None
    isTemplate: bool = Field(default=False)
    creatorId: Optional[int] = Field(default=None, foreign_key="users.id")
    type: TrackingType = Field(default=TrackingType.BOOLEAN)
    custom_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    creator: Optional["User"] = Relationship(back_populates="createdAsceticisms")
    userAsceticisms: list["UserAsceticism"] = Relationship(back_populates="asceticism")
    programItems: list["ProgramItem"] = Relationship(back_populates="asceticism")
    packageItems: list["PackageItem"] = Relationship(back_populates="asceticism")


class UserAsceticism(SQLModel, table=True):
    """User's commitment to an asceticism."""

    __tablename__ = "UserAsceticism"

    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="users.id", ondelete="CASCADE")
    asceticismId: int = Field(foreign_key="Asceticism.id", ondelete="CASCADE")
    status: AsceticismStatus = Field(default=AsceticismStatus.ACTIVE)
    startDate: datetime = Field(default_factory=datetime.utcnow)
    endDate: Optional[datetime] = None
    targetValue: Optional[float] = None
    reminderTime: Optional[datetime] = None
    custom_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="userAsceticisms")
    asceticism: "Asceticism" = Relationship(back_populates="userAsceticisms")
    logs: list["AsceticismLog"] = Relationship(back_populates="userAsceticism")


class AsceticismLog(SQLModel, table=True):
    """Daily log for an asceticism commitment."""

    __tablename__ = "AsceticismLog"

    id: Optional[int] = Field(default=None, primary_key=True)
    userAsceticismId: int = Field(foreign_key="UserAsceticism.id", ondelete="CASCADE")
    date: datetime
    completed: bool = Field(default=False)
    value: Optional[float] = None
    notes: Optional[str] = None
    custom_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    userAsceticism: "UserAsceticism" = Relationship(back_populates="logs")


# --- Package Models ---


class AsceticismPackage(SQLModel, table=True):
    """Published collection of asceticisms."""

    __tablename__ = "asceticism_packages"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    creatorId: int
    isPublished: bool = Field(default=False)
    custom_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    items: list["PackageItem"] = Relationship(back_populates="package")


class PackageItem(SQLModel, table=True):
    """Item within an asceticism package."""

    __tablename__ = "package_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    packageId: int = Field(foreign_key="asceticism_packages.id", ondelete="CASCADE")
    asceticismId: int = Field(foreign_key="Asceticism.id", ondelete="CASCADE")
    order: int = Field(default=0)
    notes: Optional[str] = None
    custom_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    # Relationships
    package: "AsceticismPackage" = Relationship(back_populates="items")
    asceticism: "Asceticism" = Relationship(back_populates="packageItems")


# --- Program Models ---


class Program(SQLModel, table=True):
    """Structured program with scheduled asceticisms."""

    __tablename__ = "Program"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    isPublic: bool = Field(default=False)
    creatorId: int
    custom_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    # Relationships
    items: list["ProgramItem"] = Relationship(back_populates="program")
    enrolledUsers: list["UserProgram"] = Relationship(back_populates="program")


class ProgramItem(SQLModel, table=True):
    """Item within a program with day range."""

    __tablename__ = "ProgramItem"

    id: Optional[int] = Field(default=None, primary_key=True)
    programId: int = Field(foreign_key="Program.id")
    asceticismId: int = Field(foreign_key="Asceticism.id")
    dayStart: int = Field(default=1)
    dayEnd: Optional[int] = None
    custom_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    # Relationships
    program: "Program" = Relationship(back_populates="items")
    asceticism: "Asceticism" = Relationship(back_populates="programItems")


class UserProgram(SQLModel, table=True):
    """User's enrollment in a program."""

    __tablename__ = "UserProgram"

    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="users.id")
    programId: int = Field(foreign_key="Program.id")
    startDate: datetime
    custom_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    # Relationships
    user: "User" = Relationship(back_populates="userPrograms")
    program: "Program" = Relationship(back_populates="enrolledUsers")


# --- Group Models ---


class Group(SQLModel, table=True):
    """User group for collaboration."""

    __tablename__ = "Group"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    inviteCode: Optional[str] = Field(default=None, unique=True)
    avatar: Optional[str] = None
    custom_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    # Relationships
    members: list["GroupMember"] = Relationship(back_populates="group")


class GroupMember(SQLModel, table=True):
    """Member of a group."""

    __tablename__ = "GroupMember"

    id: Optional[int] = Field(default=None, primary_key=True)
    groupId: int = Field(foreign_key="Group.id")
    userId: int = Field(foreign_key="users.id")
    role: GroupRole = Field(default=GroupRole.MEMBER)
    custom_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    # Relationships
    group: "Group" = Relationship(back_populates="members")
    user: "User" = Relationship(back_populates="groupMembers")


# --- Daily Readings Models ---


class MassReading(SQLModel, table=True):
    """Cached Mass readings from external API."""

    __tablename__ = "mass_readings"

    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime = Field(unique=True)
    data: dict = Field(sa_column=Column(JSON))
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class DailyReadingNote(SQLModel, table=True):
    """User's notes on daily Mass readings."""

    __tablename__ = "daily_reading_notes"

    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="users.id", ondelete="CASCADE")
    date: datetime
    notes: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="dailyReadingNotes")
