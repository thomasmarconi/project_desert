/**
 * Enums derived from the FastAPI backend.
 * These replace the Prisma-generated enums.
 */

export const UserRole = {
  USER: "USER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const TrackingType = {
  BOOLEAN: "BOOLEAN",
  NUMERIC: "NUMERIC",
  TEXT: "TEXT",
} as const;

export type TrackingType = (typeof TrackingType)[keyof typeof TrackingType];

export const AsceticismStatus = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
} as const;

export type AsceticismStatus =
  (typeof AsceticismStatus)[keyof typeof AsceticismStatus];

export const GroupRole = {
  MEMBER: "MEMBER",
  ADMIN: "ADMIN",
  MENTOR: "MENTOR",
} as const;

export type GroupRole = (typeof GroupRole)[keyof typeof GroupRole];
