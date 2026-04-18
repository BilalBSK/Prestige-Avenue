/*
  Warnings:

  - Added the required column `depositDueNow` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remainingBalance` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "depositDueNow" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "remainingBalance" DECIMAL(10,2) NOT NULL;
