import { TITTAP_EMPTY_DOC } from "../../constants/blog.constants";
import { prisma } from "../../lib/prisma";
import { createBlogDTO, DraftBlogDTO } from "./blog.schema";
import { Logger } from "pino";
import { logger } from "../../utils/logger";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../constants/httpStatus";

const serviceLogger = logger.child({service : "blog"});

function normalizeEditorJson (value : unknown) { 
    return value == null ? TITTAP_EMPTY_DOC : value;
}


export const blogService = {
    createBlogService: async (data: createBlogDTO, log : Logger  = serviceLogger ): Promise<void> => {
        const { userId, enrichedText } = data;

        const enrichedTextVal = normalizeEditorJson(enrichedText)

        const blog = await prisma.blog.create({
            data: {
                userId,
                enrichedText: enrichedTextVal,
                version : 1
            },
        });

        log.info({userId : userId, blog : blog.id}, "Blog created")
    },

    getDraftById : async (id : number, userId : number, log : Logger = serviceLogger) : Promise<DraftBlogDTO>  => {
        const draftBlog = await prisma.blog.findFirst({
            where : {
                id,
                userId,
                status : "DRAFT"
            }
        })

        if(!draftBlog){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "No draft blog found")
        }

        return draftBlog
    }
};
