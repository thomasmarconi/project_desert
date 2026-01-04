/**
 * Shared type definitions for the admin system
 * These types are used across both client and server components
 */

export enum UserRole {
  USER = "USER",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
}

export type UserRoleType = UserRole;
