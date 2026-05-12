import { NextFunction, Request, Response } from "express";
import { blogSchema } from "./blog.schema";
import { blogService } from "./blog.services";
import { sendResponse } from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { ApiError } from "../../utils/ApiError";

export const blogController = {
    createBlog : async (req : Request, res : Response, next : NextFunction) => {
       const parsedData = blogSchema.parse(req.body);

       await blogService.createBlogService(parsedData, req.log);

       sendResponse(res, HTTP_STATUS.CREATED, {
        status: true,
        message: "Blog created successfully",
       });
    },

    getDraftById : async ( req : Request, res : Response , next : NextFunction) => {
        const id = req.params;
        const userId = req.user?.id
        if(!id) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No draftId found")
        }

        await blogService.
    }
}