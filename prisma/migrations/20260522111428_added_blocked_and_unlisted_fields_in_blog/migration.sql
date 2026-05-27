-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "blockReason" TEXT,
ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "blockedBy" INTEGER,
ADD COLUMN     "unlistedAt" TIMESTAMP(3);
