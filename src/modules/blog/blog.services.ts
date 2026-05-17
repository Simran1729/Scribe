import { TITTAP_EMPTY_DOC } from "../../constants/blog.constants";
import { prisma } from "../../lib/prisma";
import { createBlogDTO, DraftBlogDTO, publishDraftDTO } from "./blog.schema";
import { Logger } from "pino";
import { logger } from "../../utils/logger";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { Prisma } from "@prisma/client";
import { jsontoHtml, jsonToText } from "../../lib/tiptap/utils";
import { JSONContent } from "@tiptap/core";
import { slugifyBlogTitle } from "../../utils/blogUtils";
import readingTime from "reading-time";

const serviceLogger = logger.child({ service: "blog" });

function normalizeEditorJson(value: unknown) {
    return value == null ? TITTAP_EMPTY_DOC : value;
}

function getDraftTitle(doc: any): string {
    const firstNode = doc?.content?.[0];

    if (!firstNode?.content) {
        return "Untitled Draft";
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

export const blogService = {
    createBlogService: async (data: createBlogDTO, log: Logger = serviceLogger): Promise<void> => {
        const { userId, enrichedText } = data;

        const enrichedTextVal = normalizeEditorJson(enrichedText)

        const blog = await prisma.blog.create({
            data: {
                userId,
                enrichedText: enrichedTextVal,
                version: 1
            },
        });

        log.info({ userId: userId, blog: blog.id }, "Blog created")
    },

    getDraftByIdService: async (id: number, userId: number, log: Logger = serviceLogger): Promise<DraftBlogDTO> => {
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
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No draft blog found")
        }

        return draftBlog
    },

    autoSaveDraftService: async (id: number, userId: number, enrichedText: Prisma.InputJsonValue, version: number, log: Logger = serviceLogger): Promise<{
        version: number
    }> => {

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
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                "Draft has newer changes already saved"
            );
        }

        log.info({ userId: userId, draftBlog: id, previousVersion: version }, "Auto save draft successful")

        return { version: version + 1 };
    },

    deleteDraftService: async (id: number, userId: number): Promise<void> => {
        const deletedDraft = await prisma.blog.deleteMany({
            where: {
                id,
                userId,
                status: "DRAFT",
                isDeleted: false
            }
        });

        if (deletedDraft.count === 0) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "No draft blog found with id for this user"
            );
        }
    },

    publishDraftService: async (data: publishDraftDTO, log: Logger = serviceLogger): Promise<void> => {
        const { id, userId, tags, title, excerpt } = data;

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
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No draft blog found with this id for this user")
        }

        const rawContent = draftBlog.enrichedText;

        if (
            typeof rawContent !== "object" ||
            rawContent === null
        ) {
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
};
