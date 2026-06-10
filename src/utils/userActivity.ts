import { prisma } from "../lib/prisma"
import { ActivityType } from "@prisma/client"
import { logger } from "./logger"

const log = logger.child({util : "userActivity"});
interface ActivityMeta {
  readTime?   : number
  scrollDepth?: number
}

export const recordActivity = async (
  userId: number,
  blogId: number,
  type  : ActivityType,
  meta? : ActivityMeta
): Promise<void> => {
  try {
    await prisma.userActivity.upsert({
      where : {
        userId_blogId_type: { userId, blogId, type }
      },
      create: {
        userId,
        blogId,
        type,
        readTime    : meta?.readTime,
        scrollDepth : meta?.scrollDepth
      },
      update: {
        updatedAt: new Date(),

        ...(meta?.readTime    && { readTime    : { increment: meta.readTime } }),

        ...(meta?.scrollDepth && { scrollDepth : meta.scrollDepth })
      }
    })
  } catch {
    log.warn( {userId, blogId, type}, "Error occursed in recording userActivity")
  }
}