/*
  Warnings:

  - Made the column `notes` on table `daily_reading_notes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "daily_reading_notes" ALTER COLUMN "notes" SET NOT NULL;
