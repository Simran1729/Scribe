import { NextFunction, Request, Response } from "express";
import { blogSchema } from "./blog.schema";
import { blogService } from "./blog.services";
import { sendResponse } from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constants/httpStatus";

export const blogController = {
    createBlog : async (req : Request, res : Response, next : NextFunction) => {
       const parsedData = blogSchema.parse(req.body);

       await blogService.createBlogService(parsedData);

       sendResponse(res, HTTP_STATUS.CREATED, {
        status: true,
        message: "Blog created successfully",
       });
    }
}
