import { NextFunction, Request, Response } from "express";
import { autoSaveDraftSchema, blogSchema, publishDraftSchema } from "./blog.schema";
import { blogService } from "./blog.services";
import { sendResponse } from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { ApiError } from "../../utils/ApiError";

export const blogController = {
    createBlog: async (req: Request, res: Response, next: NextFunction) => {
        const parsedData = blogSchema.parse(req.body);

        await blogService.createBlogService(parsedData, req.log);

        sendResponse(res, HTTP_STATUS.CREATED, {
            status: true,
            message: "Blog created successfully",
        });
    },

    getDraftById: async (req: Request, res: Response, next: NextFunction) => {
        const {id} = req.params;
        const userId = req.user?.id
        if (!id) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No draftId found")
        }

        const draft = await blogService.getDraftByIdService(Number(id), Number(userId), req.log);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Draft blog fetched successfully",
            data : draft
        })
    },

    autoSaveDraft : async (req : Request, res : Response, next : NextFunction) => {
        const { id } = req.params;
        const userId = req.user?.id;

        const parsedData = autoSaveDraftSchema.parse(req.body);
        const { enrichedText, version } = parsedData;


        if (!id) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No draftId found")
        }

        const data = await blogService.autoSaveDraftService(Number(id), Number(userId), enrichedText, version, req.log)

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Autosave draft successful",
            data
        })
    },

    deleteDraft : async (req: Request, res : Response, next : NextFunction) => {
        const { id } = req.params; 
        const userId = req.user?.id;

        if (!id) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No draftId found")
        }

        await blogService.deleteDraftService(Number(id), Number(userId)); 

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Draft Blog deleted successfully"
        })
    },

    publishDraft : async (req: Request, res : Response, next : NextFunction) => {
        /* 
        - , id , userid
        Get the id and user id to verify if it exists
        First extract the excerpt 
        Extract the html from it
        Extract the slug from it
        Extract the plaintext from it
        Extract the title from it
        Ispublished - true
        set tags for this blog post
        */

        const { id } = req.params;
        const userId = req.user?.id;
        const tags = req.body;

        const parsedData = publishDraftSchema.parse({
            id : Number(id),
            userId : Number(userId),
            tags
        })

        await blogService.publishDraft(parsedData, req.log)
        
    }
        
}