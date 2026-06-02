import { NextFunction, Request, Response } from "express";
import { autoSaveDraftSchema, blogSchema, editBlogPostSchema, publishDraftSchema } from "./blog.schema";
import { blogService } from "./blog.author.services";
import { sendResponse } from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { ApiError } from "../../utils/ApiError";
import { blogQueryParser } from "./blog.utils";

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

        await blogService.deleteDraftService(Number(id), Number(userId), req.log); 

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

        const data = await blogService.getBlogPost(Number(id), Number(userId), req.log);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Blog fetched successfully",
            data
        })
    },

    editBlogPost : async (req : Request, res : Response) => {
        // Edits and Publishes Blog Post
        const { id } = req.params;

        const userId = req.user?.id;

        if(!id){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No id found in the request")
        }

       const parsedData = editBlogPostSchema.parse({
        id : Number(id),
        userId : Number(userId),
        ...req.body
       })

       await blogService.editAndPublishBlogPostService(parsedData, req.log);

       sendResponse(res, HTTP_STATUS.OK, {
        status : true,
        message : "Blog Post Edited and Published"
       })

    },

    unlistBlogPost : async(req : Request, res : Response) => {
        const { id } = req.params;
        const userId = req.user?.id;

        if(!id){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No id found in the request")
        }
        
        await blogService.unlistBlogPostService(Number(id), Number(userId), req.log);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Blog Post unlisted successfully"
        })
    },

    relistBlogPost : async (req : Request, res : Response) => {
        const { id } = req.params;
        const userId = req.user?.id;

        if(!id){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No id found in the request")
        }

        await blogService.relistBlogPostService(Number(id), Number(userId), req.log);
        
        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Blog Relisted Successfully"
        })
    },

    deleteBlogPost : async (req : Request, res : Response) => {
        const { id } = req.params;
        const userId = req.user?.id;

        if(!id){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No id found in the request")
        }

        await blogService.deleteBlogPostService(Number(id), Number(userId), req.log);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Blog deleted succesfully"
        })

        
    },

    listMyBlogs : async (req : Request, res : Response) => {
        const userId = req.user?.id;

        const query = blogQueryParser(req);
        
        const { data, meta } = await blogService.listMyBlogsService(query , Number(userId), req.log);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "All blogs fetcehd successfully",
            data,
            meta
        })


    },


        
}