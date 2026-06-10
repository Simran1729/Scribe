-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('VIEW', 'LIKE', 'COMMENT', 'BOOKMARK', 'SHARE');

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "blogId" INTEGER NOT NULL,
    "type" "ActivityType" NOT NULL,
    "readTime" INTEGER,
    "scrollDepth" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserActivity_userId_type_idx" ON "UserActivity"("userId", "type");

-- CreateIndex
CREATE INDEX "UserActivity_blogId_type_idx" ON "UserActivity"("blogId", "type");

-- CreateIndex
CREATE INDEX "UserActivity_userId_createdAt_idx" ON "UserActivity"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserActivity_userId_blogId_type_key" ON "UserActivity"("userId", "blogId", "type");

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
