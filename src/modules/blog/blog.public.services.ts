import type { Logger } from "pino"
import { logger } from "../../utils/logger"
import { prisma } from "../../lib/prisma"
import { ApiError } from "../../utils/ApiError"
import { HTTP_STATUS } from "../../constants/httpStatus"
import { publicBlogPostDTO, publicBlogPostListDTO, publicBlogPostListSchema, publicBlogPostSchema } from "./blog.schema"
import { queryRes } from "../../utils/queryParser"

const serviceLogger = logger.child({serivce : "public blog"}) 

export const publicBlogService = {
    getBlogByIdService : async (id : number, log : Logger = serviceLogger) : Promise<publicBlogPostDTO> => {
        // *** this will get a non-draft blog by id for a blog click
        const blog = await prisma.blog.findFirst({
            where : {
                id,
                status : {
                    not : "DRAFT"
                },
                // isBlocked : false, not sure for this , if it should be able to fetch blocked blog posts or not
                isDeleted : false
            }, select : {
                id : true,
                title : true,
                excerpt : true,
                htmlText : true,
                createdAt : true,
                publishedAt : true,
            }
        })

        if(!blog){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No blog found with this slug")
        }

        const parsedBlogPost = publicBlogPostSchema.parse(blog);

        return parsedBlogPost;
    },

    getBlogBySlugService : async (slug : string, log : Logger = serviceLogger) : Promise<publicBlogPostDTO> => {
        const blog = await prisma.blog.findFirst({
            where : {
                slug,
                status : {
                    not : "DRAFT"
                },
                isDeleted : false,
                isBlocked : false
            },
            select : {
                id : true,
                title : true,
                excerpt : true,
                htmlText : true,
                createdAt : true,
                publishedAt : true,
            }
        })

        if(!blog){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No blog found with this slug")
        }

        const parsedBlogPost = publicBlogPostSchema.parse(blog);

        return parsedBlogPost;
    },

    getBlogsByUserService : async (id : number, query : queryRes , log : Logger = serviceLogger  ) : Promise<publicBlogPostListDTO> => {
        const {mode , } = query
        // **TODO : query is wip
        const user = await prisma.user.findFirst({
            where : {
                id,
                isBlocked : false,
                isActive : true,
                isEmailVerified : true,
                role : {
                    not : "ADMIN"
                }
            }
        })

        if(!user){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No active user found with this id")
        }

        const blogPosts = await prisma.blog.findMany({
            where : {
                userId : id,
                status : "PUBLISHED",
                isBlocked : false,
                isDeleted : false
            }, select : {
                    id : true,
                    title : true,
                    excerpt : true,
                    createdAt : true,
                    publishedAt : true,                
            }
        })

        return publicBlogPostListSchema.parse(blogPosts);
    },

    getFeedService : async () => {
        // ** TODO : to be implemented after interaction layer
    }

}
