import type { Logger } from "pino"
import { logger } from "../../utils/logger"
import { prisma } from "../../lib/prisma"
import { ApiError } from "../../utils/ApiError"
import { HTTP_STATUS } from "../../constants/httpStatus"
import { publicBlogPostDTO, publicBlogPostListDTO, publicBlogPostListSchema, publicBlogPostSchema } from "./blog.schema"
import { queryRes } from "../../utils/queryParser"
import { cursorPaginate } from "../../utils/pagination"
import type { PaginationMeta } from "../../utils/sendResponse"
import type { Prisma } from "@prisma/client"

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
                isBlocked : false,
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

    getBlogsByUserService : async (username : string, query : queryRes , log : Logger = serviceLogger  ) : Promise<{data : publicBlogPostListDTO, meta : PaginationMeta}> => {
        const {search, limit, cursor, order, sortBy } = query
        const user = await prisma.user.findFirst({
            where : {
                username,
                isBlocked : false,
                isActive : true,
                isEmailVerified : true,
                role : {
                    not : "ADMIN"
                }
            },
            select : {id : true}
        })

        if(!user){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No active user found with this username")
        }

        const allowedSortFields = ["createdAt", "publishedAt", "readingTime", "viewCount"];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
        const normalizedSearch = search?.trim();

        const where : Prisma.BlogWhereInput = {
                userId : user.id,
                status : "PUBLISHED",
                isBlocked : false,
                isDeleted : false,
                ...(normalizedSearch && {
                    OR : [
                        { title : { contains : normalizedSearch, mode : "insensitive" } },
                        { excerpt : { contains : normalizedSearch, mode : "insensitive" } }
                    ]
                })
        }

        const orderBy : Prisma.BlogOrderByWithRelationInput[] = [
            { [safeSortBy] : order } as Prisma.BlogOrderByWithRelationInput,
            { id : order }
        ]

        const blogPosts = await prisma.blog.findMany({
            where,
            orderBy,
            take : limit + 1,
            ...(cursor && {
                cursor : {id : Number(cursor)},
                skip : 1
            }),
            select : {
                    id : true,
                    title : true,
                    excerpt : true,
                    createdAt : true,
                    publishedAt : true,                
            }
        })

        const { data, meta } = cursorPaginate(blogPosts, limit, (blog) => blog.id);

        log.info(
            { userId: user.id, hasSearch: Boolean(search), sortBy: safeSortBy, order, limit, cursor, returned: data.length, hasNextPage: meta.hasNextPage },
            "Public blogs by user fetched successfully"
        );

        return { data : publicBlogPostListSchema.parse(data), meta };
    },

    getFeedService : async () => {
        // ** TODO : to be implemented after interaction layer
    }

}
