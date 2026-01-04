# Admin System Documentation

## Overview

This application now includes a comprehensive user role and administration system that allows administrators to manage users, assign roles, and ban/unban users.

## User Roles

The system supports three user roles:

### 1. **USER** (Default)

- Standard user with basic access to the application
- Can create and manage their own asceticisms
- Can join groups and participate in programs

### 2. **MODERATOR**

- Enhanced permissions for community management
- Can moderate content and assist users
- Future: Will have additional moderation capabilities

### 3. **ADMIN**

- Full administrative access
- Can access the admin dashboard at `/admin`
- Can manage all users:
  - View all user accounts
  - Change user roles
  - Ban/unban users
- Cannot demote themselves or ban themselves (safety feature)

## Admin Dashboard

### Accessing the Dashboard

Navigate to `/admin` to access the admin dashboard. Only users with the `ADMIN` role can access this page.

### Features

#### User Management Table

- **User Information**: Displays avatar, name, and email for each user
- **Role Management**: Dropdown to change user roles (USER, MODERATOR, ADMIN)
- **Status Indicators**:
  - Role badges (color-coded by role)
  - Banned status badge
  - Email verification badge
- **Activity Metrics**: Shows number of practices and groups for each user
- **Ban/Unban Actions**: Button to ban or unban users

#### Security Features

- Admins cannot change their own role (prevents accidental lockout)
- Admins cannot ban themselves
- Banned users cannot access the application
- All actions require admin authentication

## Database Schema

### User Model Updates

```prisma
model User {
  id            Int       @id @default(autoincrement())
  name          String?   @db.VarChar(255)
  email         String?   @unique @db.VarChar(255)
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(USER)    // New field
  isBanned      Boolean   @default(false)   // New field

  // ... other fields
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}
```

## Setup Instructions

### 1. Database Migration

The database has already been migrated with the new schema. If you need to run migrations again:

```bash
npx prisma migrate dev
```

### 2. Creating Your First Admin

After signing in for the first time with Google OAuth, run the seed script to promote your account to admin:

```bash
npx prisma db seed
```

This will promote the first user in the database to the ADMIN role.

Alternatively, you can manually update a user in Prisma Studio:

```bash
npx prisma studio
```

Then navigate to the `users` table and set:

- `role` = `ADMIN`
- `isBanned` = `false`

### 3. Accessing the Admin Panel

Once you have admin privileges, navigate to `/admin` to access the admin dashboard.

## Architecture

The admin system follows a clean separation of concerns:

### Backend (FastAPI - `/api`)

- **Database Operations**: All Prisma database queries are executed in the FastAPI backend
- **Authorization**: User authentication and role verification happens on the backend
- **API Endpoints**: RESTful endpoints under `/admin/*` handle all admin operations

### Frontend (Next.js - `/frontend`)

- **Service Layer**: `lib/services/adminService.ts` makes HTTP requests to the FastAPI backend
- **UI Components**: React components for displaying and managing users
- **Server Actions**: Next.js server actions handle authentication headers and API communication

## API Endpoints

All endpoints require the `x-user-email` header for authentication.

### `GET /admin/users`

Fetches all users with their details and activity counts.

**Response:**

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://...",
    "role": "ADMIN",
    "isBanned": false,
    "emailVerified": "2024-01-01T00:00:00Z",
    "userAsceticismsCount": 5,
    "groupMembersCount": 2
  }
]
```

### `POST /admin/users/role`

Updates a user's role. Prevents admins from demoting themselves.

**Request Body:**

```json
{
  "userId": 1,
  "newRole": "MODERATOR"
}
```

### `POST /admin/users/ban`

Bans or unbans a user. Prevents admins from banning themselves.

**Request Body:**

```json
{
  "userId": 1,
  "isBanned": true
}
```

### `GET /admin/current-user`

Gets the current authenticated user's information including role and ban status.

**Response:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ADMIN",
  "isBanned": false
}
```

## Security Considerations

1. **Authorization Checks**: All admin actions verify that the current user has the ADMIN role
2. **Self-Protection**: Admins cannot modify their own role or ban status
3. **Banned User Handling**: Banned users are immediately blocked from all application access
4. **Session Validation**: All actions verify active authentication sessions

## Future Enhancements

Potential improvements for the admin system:

1. **Audit Logging**: Track all admin actions (role changes, bans, etc.)
2. **Bulk Actions**: Select multiple users for batch operations
3. **User Search/Filter**: Search users by name, email, or role
4. **Moderator Permissions**: Define specific permissions for the MODERATOR role
5. **Ban Reasons**: Add ability to specify and view reasons for bans
6. **Temporary Bans**: Implement time-limited bans
7. **Activity Dashboard**: Analytics on user engagement and platform usage
8. **Email Notifications**: Notify users of role changes or bans

## Troubleshooting

### "Unauthorized: Admin access required"

- Ensure your user account has the ADMIN role
- Run the seed script or manually update your role in Prisma Studio

### "Cannot read properties of null"

- Ensure you're signed in with a valid Google account
- Check that your session is active

### Changes not reflecting

- Clear your browser cache
- Check that the database migration was successful
- Verify Prisma Client was regenerated: `npx prisma generate`
