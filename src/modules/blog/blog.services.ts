import { TITTAP_EMPTY_DOC } from "../../constants/blog.constants";
import { prisma } from "../../lib/prisma";
import { createBlogDTO, DraftBlogDTO, publishDraftDTO } from "./blog.schema";
import { Logger } from "pino";
import { logger } from "../../utils/logger";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { Prisma } from "@prisma/client";
import { version } from "node:os";

const serviceLogger = logger.child({ service: "blog" });

function normalizeEditorJson(value: unknown) {
    return value == null ? TITTAP_EMPTY_DOC : value;
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
                status: "DRAFT"
            },select: {
                id: true,
                userId : true,
                status: true,
                enrichedText: true,
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

    autoSaveDraftService :  async(id : number, userId : number, enrichedText : Prisma.InputJsonValue , version : number,  log : Logger = serviceLogger) : Promise<{
        version : number
    }> => {
        
        const enrichedTextVal = normalizeEditorJson(enrichedText);

        const updatedDraft = await prisma.blog.updateMany({
            where: {
            id,
            userId,
            status: "DRAFT",
            version
            },
            data: {
            enrichedText: enrichedTextVal,
            version: {
                increment: 1
            }
            }
        });

        if(updatedDraft.count === 0){
                throw new ApiError(
                HTTP_STATUS.CONFLICT,
                "Draft has newer changes already saved"
                );
        }

        log.info({userId : userId, draftBlog : id, previousVersion : version} , "Auto save draft successful")

        return {version : version+1 };
    },

    deleteDraftService : async (id : number, userId : number ) : Promise<void> => {
        const deletedDraft = await prisma.blog.updateMany({
            where: {
            id,
            userId,
            status: "DRAFT",
            isDeleted: false
            },
            data: {
            isDeleted: true
            }
        });

        if (deletedDraft.count === 0) {
            throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            "No draft blog found with id for this user"
            );
        }
    },

    publishDraft : async (data : publishDraftDTO, log : Logger = serviceLogger) : Promise<void> => {
        const { id, userId, tags } = data;

        const draftBlog = await prisma.blog.findFirst({
            where : {
                id,
                userId
            }
        })

        if(!draftBlog){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No blog found with id for this user")
        }

        const enrichedText = draftBlog.enrichedText;
        const 
    } 
};
