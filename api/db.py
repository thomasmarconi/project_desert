"""Database module for Project Desert API.

Provides a shared Prisma client instance for database operations.
"""

from prisma import Prisma

db = Prisma()
