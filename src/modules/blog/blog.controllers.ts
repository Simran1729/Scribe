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

        const { id } = req.params;
        const userId = req.user?.id;
        const { tags, title, excerpt } = req.body;

        const parsedData = publishDraftSchema.parse({
            id : Number(id),
            userId : Number(userId),
            tags,
            title,
            excerpt
        })

        await blogService.publishDraftService(parsedData, req.log)

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Blog published successfully"
        })
    },

    getEditableBlogPost : async (req: Request, res : Response) => {
        const { id } = req.params;
        const userId = req.user?.id;

        if(!id){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No id found in the request")
        }

        const data = await blogService.getBlogPost(Number(id), Number(userId));

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Blog fetched successfully",
            data
        })
    },

    editBlogPost : async (req : Request, res : Response) => {
        const { id } = req.params;

        // const 
    },

    unlistBlogPost : async(req : Request, res : Response) => {

    },

    deleteBlogPost : async (req : Request, res : Response) => {

    },

    relistBlogPost : async (req : Request, res : Response) => {

    },

    listMyBlogs : async (req : Request, res : Response) => {

    }
        
}