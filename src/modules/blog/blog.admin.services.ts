import { Logger } from "pino";
import { blockBlogDTO } from "./blog.schema";
import { logger } from "../../utils/logger";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../constants/httpStatus";

const serviceLogger = logger.child({service : "admin blog"})

export const blogAdminService = {
    blockBlogService : async (data : blockBlogDTO, log : Logger = serviceLogger ) => {
        const { id, userId, blockReason} = data;

        log.info({blogId : id, userId : userId } , "Blocking Blog Post")

        const blogPost = await prisma.blog.findFirst({
            where : {
                id,
                status : {
                    not : "DRAFT"
                }
            }
        })

        if(!blogPost){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No BlogPost found with this id")
        }

        await prisma.blog.update({
            where : {
                id
            },
            data : {
                isBlocked : true,
                blockedBy : userId,
                blockedAt : new Date(),
                blockReason
            }
        })

        log.info({blogId : id, userId : userId }, "BlogPost blocked successfully")
    },

    unblockBlogService : async (id : number, log : Logger = serviceLogger) => {

        log.info({blogId : id} , "Unblocking Blog Post")

        const blockedBlogPost = await prisma.blog.findFirst({
            where : {
                id,
                isBlocked : true
            }
        })

        if(!blockedBlogPost){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No blocked Blog Post found with this id")
        }

        await prisma.blog.update({
            where : {
                id
            },
            data : {
                isBlocked : false,
                blockedAt : null,
                blockReason : null,
                blockedBy : null
            }
        })
    
        log.info({blogId : id}, "BlogPost unblocked successfully")
    }
}