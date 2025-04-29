/*
  Warnings:

  - Added the required column `timeRange` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "timeRange" TEXT NOT NULL;
