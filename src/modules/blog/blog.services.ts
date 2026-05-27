import { TITTAP_EMPTY_DOC } from "../../constants/blog.constants";
import { prisma } from "../../lib/prisma";
import { createBlogDTO, DraftBlogDTO, editBlogPostSchema, getBlogPostDTO, publishDraftDTO } from "./blog.schema";
import { Logger } from "pino";
import { logger } from "../../utils/logger";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { BlogStatus, Prisma } from "@prisma/client";
import { jsontoHtml, jsonToText } from "../../lib/tiptap/utils";
import { JSONContent } from "@tiptap/core";
import { blogQueryRes, slugifyBlogTitle } from "./blog.utils";
import readingTime from "reading-time";
import { queryRes } from "../../utils/queryParser";
import { PaginationMeta } from "../../utils/sendResponse";
import { offsetPaginate } from "../../utils/pagination";

const serviceLogger = logger.child({ service: "blog" });

function normalizeEditorJson(value: unknown) {
    return value == null ? TITTAP_EMPTY_DOC : value;
}

function getDraftTitle(doc: any): string {
    const firstNode = doc?.content?.[0];

    if (!firstNode?.content) {
        return "";
    }

    return firstNode.content
        .map((item: any) => item.text || "")
        .join("")
        .slice(0, 100);
}

async function generateUniqueSlug(title: string, blogId: number): Promise<string> {
    const baseSlug = slugifyBlogTitle(title);

    const existing = await prisma.blog.findUnique({
        where: { slug: baseSlug },
        select: { id: true },
    });

    if (!existing || existing.id === blogId) return baseSlug;

    return `${baseSlug}-${blogId}`;
}

type listMyBlogsDTO = {
    id:           number,
    title:        string | null,
    excerpt?:     string | null,
    readingTime?: number | null,
    status:       BlogStatus,
    version:      number,
    createdAt:    Date,
    updatedAt:    Date,
    publishedAt?: Date | null,
    unlistedAt?:  Date | null,
    isBlocked:    boolean,
    blockedAt?:   Date | null,
    blockReason?: string | null,
}

export const blogService = {

    // ** Draft Blog Service ** 

    createBlogService: async (data: createBlogDTO, log: Logger = serviceLogger): Promise<void> => {
        const { userId, enrichedText } = data;
        log.info({ userId }, "Creating a new draft blog");

        const enrichedTextVal = normalizeEditorJson(enrichedText)

        const blog = await prisma.blog.create({
            data: {
                userId,
                enrichedText: enrichedTextVal,
                version: 1
            },
        });

        log.info({ userId: userId, blog: blog.id }, "Draft blog created successfully")
    },

    getDraftByIdService: async (id: number, userId: number, log: Logger = serviceLogger): Promise<DraftBlogDTO> => {
        log.info({ draftId: id, userId }, "Fetching draft blog by ID");
        const draftBlog = await prisma.blog.findFirst({
            where: {
                id,
                userId,
                status: "DRAFT",
                isDeleted: false,
                isBlocked: false
            }, select: {
                id: true,
                userId: true,
                status: true,
                enrichedText: true,
                title: true,
                version: true,
                createdAt: true,
                updatedAt: true
            }
        })

        if (!draftBlog) {
            log.warn({ draftId: id, userId }, "Draft blog not found");
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No draft blog found")
        }

        log.info({ draftId: id, userId }, "Draft blog fetched successfully");
        return draftBlog
    },

    autoSaveDraftService: async (id: number, userId: number, enrichedText: Prisma.InputJsonValue, version: number, log: Logger = serviceLogger): Promise<{
        version: number
    }> => {
        log.info({ draftId: id, userId, version }, "Auto-saving draft blog");
        const enrichedTextVal = normalizeEditorJson(enrichedText);
        const draftTitle = getDraftTitle(enrichedTextVal);


        const updatedDraft = await prisma.blog.updateMany({
            where: {
                id,
                userId,
                status: "DRAFT",
                version
            },
            data: {
                enrichedText: enrichedTextVal,
                title: draftTitle,
                version: {
                    increment: 1
                }
            }
        });

        if (updatedDraft.count === 0) {
            log.warn({ draftId: id, userId, version }, "Draft auto-save failed due to version mismatch");
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                "Draft has newer changes already saved"
            );
        }

        log.info({ userId: userId, draftBlog: id, previousVersion: version }, "Auto save draft successful")

        return { version: version + 1 };
    },

    deleteDraftService: async (id: number, userId: number, log: Logger = serviceLogger): Promise<void> => {
        log.info({ draftId: id, userId }, "Deleting draft blog");
        const deletedDraft = await prisma.blog.deleteMany({
            where: {
                id,
                userId,
                status: "DRAFT",
                isDeleted: false
            }
        });

        if (deletedDraft.count === 0) {
            log.warn({ draftId: id, userId }, "Delete draft failed: draft not found or already deleted");
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "No draft blog found with id for this user"
            );
        }

        log.info({ draftId: id, userId }, "Draft blog deleted successfully");
    },

    publishDraftService: async (data: publishDraftDTO, log: Logger = serviceLogger): Promise<void> => {
        const { id, userId, tags, title, excerpt } = data;
        log.info({ blogId: id, userId, tagCount: tags.length }, "Publishing draft blog");

        const draftBlog = await prisma.blog.findFirst({
            where: {
                id,
                userId,
                status: "DRAFT",
                isDeleted: false,
                isBlocked: false,
            }
        })

        if (!draftBlog) {
            log.warn({ blogId: id, userId }, "Publish draft failed: draft not found");
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No draft blog found with this id for this user")
        }

        const rawContent = draftBlog.enrichedText;

        if (
            typeof rawContent !== "object" ||
            rawContent === null
        ) {
            log.warn({ blogId: id, userId }, "Publish draft failed: invalid editor content");
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Invalid editor content"
            );
        }

        const enrichedText = rawContent as JSONContent;
        const htmlText = jsontoHtml(enrichedText);
        const plainText = jsonToText(enrichedText);

        const slug = await generateUniqueSlug(title, id);
        const timeToRead = readingTime(plainText);

        if (tags.length > 0) {
            const existingTags = await prisma.tag.findMany({
                where: { id: { in: tags } },
                select: { id: true }
            });

            if (existingTags.length !== tags.length) {
                const foundIds = new Set(existingTags.map((t) => t.id));
                const missing = tags.filter((t) => !foundIds.has(t));
                log.warn({ blogId: id, userId, missingTags: missing }, "Publish draft failed: some tags were not found");
                throw new ApiError(
                    HTTP_STATUS.BAD_REQUEST,
                    `Tags not found: ${missing.join(", ")}`
                );
            }
        }

        // Atomic transaction: update blog + create PostTags + increment usageCount
        await prisma.$transaction([
            // 1. Update the blog to PUBLISHED
            prisma.blog.update({
                where: { id },
                data: {
                    title,
                    excerpt,
                    htmlText,
                    plainText,
                    slug,
                    readingTime: Math.ceil(timeToRead.minutes),
                    status: "PUBLISHED",
                    publishedAt: new Date(),
                }
            }),

            // 2. Create PostTags join rows (link tags to blog)
            ...(tags.length > 0
                ? [
                    prisma.postTags.createMany({
                        data: tags.map((tagId) => ({
                            blogId: id,
                            tagId,
                        })),
                        skipDuplicates: true,
                    }),
                ]
                : []),

            // 3. Increment usageCount on each attached tag
            ...(tags.length > 0
                ? [
                    prisma.tag.updateMany({
                        where: { id: { in: tags } },
                        data: { usageCount: { increment: 1 } },
                    }),
                ]
                : []),
        ]);

        log.info(
            { blogId: id, userId, slug, tagCount: tags.length },
            "Blog published successfully"
        );
    },

    // ** Blog Post Services **
    
    getBlogPost: async (id: number, userId: number, log: Logger = serviceLogger): Promise<getBlogPostDTO> => {
        log.info({ blogId: id, userId }, "Fetching published blog post");
        const blogPost = await prisma.blog.findFirst({
            where: {
                id,
                userId,
                status: "PUBLISHED"
            }, select: {
                id: true,
                userId: true,
                enrichedText: true,
                version: true,
                createdAt: true,
                updatedAt: true,
                publishedAt: true,
                title: true,
                status: true,
                excerpt: true,
                postTags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })

        if (!blogPost) {
            log.warn({ blogId: id, userId }, "Blog post not found or not published");
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No published blog found with this id for this user")
        }

        if (!blogPost.title || !blogPost.publishedAt) {
            log.error({ blogId: id, userId }, "Published blog post is missing required fields (title or publishedAt)");
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Published blog post has missing title or publication date");
        }

        const formattedBlog: getBlogPostDTO = {
            id: blogPost.id,
            userId: blogPost.userId,
            enrichedText: blogPost.enrichedText,
            version: blogPost.version,
            status: blogPost.status,
            createdAt: blogPost.createdAt,
            updatedAt: blogPost.updatedAt,
            title: blogPost.title,
            publishedAt: blogPost.publishedAt,
            excerpt: blogPost.excerpt ?? undefined,
            tags: blogPost.postTags.map((t) => t.tag)
        };

        log.info({ blogId: id, userId }, "Published blog post fetched successfully");
        return formattedBlog;
    },

    editAndPublishBlogPostService : async (data : editBlogPostSchema , log : Logger = serviceLogger) => {
        const { id, userId, title, excerpt, enrichedText, tags}  = data;

        const publishedBlogPost = await prisma.blog.findFirst({
            where : {
                id,
                userId,
                status : "PUBLISHED", 
                isDeleted : false,
                isBlocked : false
            }
        })

        if (!publishedBlogPost) {
            log.warn({ blogId: id, userId }, "Edit failed: published blog not found");
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No Published Blog found for this user for this id");
        }

        const rawContent = enrichedText;

        if (
            typeof rawContent !== "object" ||
            rawContent === null
        ) {
            log.warn({ blogId: id, userId }, "Publish draft failed: invalid editor content");
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Invalid editor content"
            );
        }


        const htmlText = jsontoHtml(rawContent as JSONContent);
        const plainText = jsonToText(rawContent as JSONContent);
        const timeToRead = readingTime(plainText);

        const slug = title ? await generateUniqueSlug(title, id) : undefined;
    

        // Start interactive transactions
        await prisma.$transaction(async (tx) => {
            if(tags !== undefined){
                const blogWithTags = await tx.blog.findFirst({
                    where : {
                        id
                    },
                    select : {
                        postTags : {
                            select : {
                                tagId : true
                            }
                        }
                    }
                })

                const currentTagIds = new Set(blogWithTags?.postTags.map(pt => pt.tagId) ?? []);
                const newTagIds = new Set(tags);

                const tagsToAdd = tags.filter(t => !currentTagIds.has(t));
                const tagsToRemove = [...currentTagIds].filter(t => !newTagIds.has(t));

                if(tagsToAdd.length > 0){
                    const existingTags = await tx.tag.findMany({
                        where : {
                            id : { 
                                in : tagsToAdd
                            }
                        },
                        select : {
                            id : true
                        }
                    })

                    if (existingTags.length !== tagsToAdd.length) {
                        const foundIds = new Set(existingTags.map(t => t.id));
                        const missing  = tagsToAdd.filter(t => !foundIds.has(t));
                        log.warn({ blogId: id, userId, missingTags: missing }, "Edit failed: tags not found");
                        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Tags not found: ${missing.join(", ")}`);
                    }
                }

                await Promise.all([
                    tagsToAdd.length > 0 
                    ? tx.postTags.createMany({
                        data : tagsToAdd.map(tagId => ({blogId : id, tagId})),
                        skipDuplicates : true,
                    })
                    : Promise.resolve(),

                    tagsToAdd.length > 0 
                    ? tx.tag.updateMany({
                        where : {
                            id : { in : tagsToAdd}
                        },
                        data :{ 
                            usageCount : { increment : 1}
                        }
                    })
                    : Promise.resolve(),

                    tagsToRemove.length > 0
                    ? tx.postTags.deleteMany({
                        where : {blogId : id, tagId : { in : tagsToRemove}}
                    })
                    : Promise.resolve(),

                    tagsToRemove.length > 0
                    ? tx.tag.updateMany({
                        where : {
                            id : { in : tagsToRemove},
                            usageCount : {gt : 0}
                        },
                        data : {
                            usageCount : {
                                decrement : 1
                            }
                        }
                    })
                    : Promise.resolve()
                ])
            }
            await tx.blog.update({
                    where : {id},
                    data : {
                        ...(title && {title, slug}),
                        ...(excerpt && {excerpt}),
                        enrichedText : rawContent,
                        htmlText,
                        plainText,
                        readingTime : Math.ceil(timeToRead.minutes),
                        version : { increment : 1}
                    }
            })
        })

        log.info({ blogId: id, userId, slug }, "Blog post edited and published successfully");  
    },

    unlistBlogPostService : async(id : number, userId : number, log : Logger = serviceLogger) => {
        log.info({ blogId: id, userId }, "Unlisting blog post")

        const publishedBlog = await prisma.blog.findFirst({
            where : {
                id,
                userId,
                status : "PUBLISHED",
                isDeleted : false,
                isBlocked : false
            }
        })

        if(!publishedBlog){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No published blog found to be unlisted with this id and this user")
        }

        await prisma.blog.update({
            where : {
                id
            },
            data : {
                status : "UNLISTED",
                unlistedAt : new Date()
            }
        })

        log.info({unListedBlog : id}, "Blog unlisted successfully")
    },

    relistBlogPostService : async(id : number, userId : number, log : Logger = serviceLogger) => {
        log.info({ blogId: id, userId }, "Blog relisted successfully")

        const unlistedBlogPost = await prisma.blog.findFirst({
            where : {
                id,
                userId,
                status : "UNLISTED",
                isBlocked : false,
                isDeleted : false
            }
        })

        if(!unlistedBlogPost){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No unlisted blog found for this id for this User")
        }

        await prisma.blog.update({
            where : {
                id
            },
            data : {
                status : "PUBLISHED",
                unlistedAt : null
            }
        })

        log.info({blogId : id}, "Blog reslited Successfully")
    },

    deleteBlogPostService : async(id : number, userId : number, log : Logger = serviceLogger) => {
        log.info({ blogId: id, userId }, "Deleting blog post")
        const blogPost = await prisma.blog.findFirst({
            where : {
                id, 
                userId,
                status : { in : ["PUBLISHED", "UNLISTED"]},
                isDeleted : false
            }
        })

        if(!blogPost){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No Blog Post found with this id for this user")
        }

        await prisma.$transaction([
            prisma.blog.update({
            where : {
                id
            },
                data : {
                    isDeleted : true,
                    deletedAt : new Date()
                }
            }),

            prisma.postTags.deleteMany({
                where : {
                    blogId : id
                }
            })
        ]);

    },

    listMyBlogsService : async (
        query : blogQueryRes, 
        userId : number, 
        log : Logger = serviceLogger
    ) : Promise<{data : listMyBlogsDTO[] , meta : PaginationMeta}> => {
        const {sortBy,search, order, limit, page, status, isBlocked } = query;

        const allowedSortFields = ["createdAt", "updatedAt", "readingTime","publishedAt"];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

        const normalizedSearch = search ? search.trim().toLowerCase() : null;

        const where : Prisma.BlogWhereInput = {
            userId,
            isDeleted : false,


            ... (status !== undefined && {status}),
            ...(isBlocked !== undefined && {isBlocked}),

            ...(normalizedSearch && {
                OR : [
                    {
                        AND : [
                            {title : {not : ""}},
                            {title : {not : null}},
                            {title : {contains : normalizedSearch, mode : "insensitive"}}
                        ]
                    },
                    {
                        AND : [
                            {excerpt : {not : ""}},
                            {excerpt : {not : null}},
                            {excerpt : {contains : normalizedSearch, mode : "insensitive"}}
                        ]
                    }
                ]
            })
            
        }

        const orderBy : Prisma.BlogOrderByWithRelationInput[] = [
            { [safeSortBy] : order } as Prisma.BlogOrderByWithRelationInput,
            { id : order }
        ]

        const skip = (page - 1) * limit;
        const [total, rows] = await prisma.$transaction([
            prisma.blog.count({where}),
            prisma.blog.findMany({
                where,
                orderBy,
                skip,
                take : limit,
                select : {
                    id : true,
                    title : true,
                    excerpt : true,
                    readingTime : true,
                    status : true,
                    version : true,
                    createdAt : true,
                    publishedAt : true,
                    unlistedAt : true,
                    blockedAt : true,
                    blockReason : true,
                    updatedAt : true,
                    isBlocked : true
                }
            })
        ])

        const {data, meta }  = offsetPaginate(rows,page, limit, total);

        log.info(
            { userId, total, page, returned: data.length, hasNextPage: meta.hasNextPage },
            "My blogs fetched successfully"
        );
        return { data, meta };

    }
};
