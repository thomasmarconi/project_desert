# Project Desert API

FastAPI backend using SQLModel (SQLAlchemy 2.0) and Alembic for migrations.

## Quick Start

### 1. Navigate to API Directory

**IMPORTANT:** Always run commands from the `api/` directory, not from `api/app/`

```bash
cd api
```

### 2. Activate Virtual Environment

```bash
# Windows
source venv/Scripts/activate

# Linux/Mac
source venv/bin/activate
```

### 3. Start the API

```bash
# Run from api/ directory (not api/app/)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Docs:** http://localhost:8000/docs
- **OpenAPI:** http://localhost:8000/openapi.json

**Common mistake:** Running from `api/app/` will cause `ModuleNotFoundError: No module named 'app'`

## Working with Database Models

### Defining New Models

Models are defined in [`app/models/__init__.py`](app/models/__init__.py) using SQLModel.

**Example: Creating a new model**

```python
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship, Column
from sqlalchemy import JSON

class MyNewModel(SQLModel, table=True):
    """Description of the model."""
    __tablename__ = "my_new_models"

    # Primary key
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Regular fields
    name: str
    description: Optional[str] = None
    
    # Foreign keys
    userId: int = Field(foreign_key="users.id", ondelete="CASCADE")
    
    # JSON field (avoid naming it "metadata" - it's reserved!)
    custom_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: "User" = Relationship(back_populates="myNewModels")
```

**Important Rules:**
- ✅ Use `Optional[int]` for primary keys with `Field(default=None, primary_key=True)`
- ✅ Use `custom_metadata` instead of `metadata` (reserved by SQLAlchemy)
- ✅ Define `__tablename__` explicitly
- ✅ Use `Field(foreign_key="table.column", ondelete="CASCADE")` for foreign keys
- ✅ Use `Field(sa_column=Column(JSON))` for JSON fields
- ✅ Add timestamps: `createdAt` and `updatedAt`

### Changing Existing Models

When you modify a model in [`app/models/__init__.py`](app/models/__init__.py):

1. **Make your changes** to the model class
2. **Generate a migration** (see below)
3. **Apply the migration** (see below)

**Example: Adding a field**

```python
class User(SQLModel, table=True):
    # ... existing fields ...
    
    # New field
    phoneNumber: Optional[str] = None  # Add this line
```

## Database Migrations with Alembic

### Creating a Migration

After changing models, generate a migration:

```bash
alembic revision --autogenerate -m "description_of_change"
```

**Examples:**
```bash
# Adding a new table
alembic revision --autogenerate -m "add_notifications_table"

# Adding a field
alembic revision --autogenerate -m "add_phone_number_to_users"

# Changing a field type
alembic revision --autogenerate -m "change_age_to_integer"
```

This creates a new file in `alembic/versions/` with the timestamp and description.

### Reviewing a Migration

Always review the generated migration file before applying:

```bash
# Find the latest migration
ls alembic/versions/

# Open it in your editor
code alembic/versions/[latest_file].py
```

Check the `upgrade()` and `downgrade()` functions to ensure they're correct.

### Applying Migrations

Apply all pending migrations:

```bash
alembic upgrade head
```

### Rolling Back Migrations

Roll back the last migration:

```bash
alembic downgrade -1
```

Roll back to a specific revision:

```bash
alembic downgrade <revision_id>
```

### Checking Migration Status

See current migration status:

```bash
alembic current
```

See migration history:

```bash
alembic history
```

## Common Workflows

### Adding a New Feature with Database Changes

1. **Define the model** in `app/models/__init__.py`
2. **Create Pydantic schemas** in `app/schemas/my_feature.py`
3. **Generate migration:**
   ```bash
   alembic revision --autogenerate -m "add_my_feature_table"
   ```
4. **Review the migration file**
5. **Apply migration:**
   ```bash
   alembic upgrade head
   ```
6. **Create route handlers** in `app/api/routes/my_feature.py`
7. **Register routes** in `app/main.py`
8. **Test the API**

### Modifying an Existing Field

1. **Change the model** in `app/models/__init__.py`
2. **Generate migration:**
   ```bash
   alembic revision --autogenerate -m "modify_user_email_field"
   ```
3. **Review the migration** - ensure data won't be lost
4. **Apply migration:**
   ```bash
   alembic upgrade head
   ```
5. **Update affected schemas** in `app/schemas/`
6. **Update affected routes** in `app/api/routes/`
7. **Test thoroughly**

### Adding a New Endpoint (No DB Changes)

1. **Create Pydantic schemas** (if needed) in `app/schemas/`
2. **Add route handler** in appropriate file in `app/api/routes/`
3. **Register router** in `app/main.py` (if new router)
4. **Test at** http://localhost:8000/docs

## Project Structure

```
api/
├── app/
│   ├── main.py              # FastAPI app & router registration
│   ├── core/
│   │   ├── config.py        # Settings from .env
│   │   └── database.py      # DB engine & session
│   ├── models/
│   │   └── __init__.py      # SQLModel table definitions
│   ├── schemas/
│   │   ├── admin.py         # Pydantic request/response models
│   │   ├── asceticisms.py
│   │   ├── packages.py
│   │   └── daily_readings.py
│   └── api/
│       └── routes/
│           ├── admin.py     # Route handlers
│           ├── asceticisms.py
│           ├── packages.py
│           └── daily_readings.py
├── alembic/
│   ├── versions/            # Migration files
│   └── env.py               # Alembic config
├── alembic.ini
├── requirements.txt
└── .env                     # DATABASE_URL and secrets
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

## Troubleshooting

### "Table already exists" error
You're trying to create a table that exists. Either:
- Drop the table manually
- Use `alembic stamp head` if the DB matches your models

### "No module named 'app'" error
Run from the `api/` directory:
```bash
cd api
python -m uvicorn app.main:app --reload
```

### Migration creates unwanted changes
Edit the migration file in `alembic/versions/` before running `alembic upgrade head`.

### Field name conflicts
Avoid these reserved names:
- `metadata` (use `custom_metadata`)
- `registry`
- `_sa_*` (any SQLAlchemy internal names)

## Dependencies

Install or update dependencies:

```bash
pip install -r requirements.txt
```

Core dependencies:
- `fastapi[standard]` - Web framework
- `sqlmodel` - ORM (SQLAlchemy + Pydantic)
- `alembic` - Database migrations
- `psycopg2-binary` - PostgreSQL driver
- `python-dotenv` - Environment variables
- `pydantic-settings` - Settings management

## Testing

Access the interactive API docs to test endpoints:

http://localhost:8000/docs

All endpoints are documented there with:
- Request/response schemas
- Example values
- Try it out functionality

## Additional Resources

- **[SETUP.md](SETUP.md)** - Initial setup guide
- **[MIGRATION.md](MIGRATION.md)** - Technical migration details from Prisma
- **[CHECKLIST.md](CHECKLIST.md)** - Complete migration checklist
- **SQLModel Docs:** https://sqlmodel.tiangolo.com/
- **Alembic Docs:** https://alembic.sqlalchemy.org/
- **FastAPI Docs:** https://fastapi.tiangolo.com/
