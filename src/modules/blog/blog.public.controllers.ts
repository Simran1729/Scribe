import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { publicBlogService } from "./blog.public.services";
import { sendResponse } from "../../utils/sendResponse";
import { queryParser } from "../../utils/queryParser";

export const blogPublicController = {
    getBlogById : async (req : Request, res : Response) => {
        const { id } = req.params;
        if(!id){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No id found in the request")
        }

        const data = await publicBlogService.getBlogByIdService(Number(id), req.log);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Blog Post fetched successfully",
            data
        })
    },

    getBlogBySlug : async (req : Request, res : Response) => {
        const { slug } = req.params;

        if(!slug){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No slug found in url params")
        }

        const data = await publicBlogService.getBlogBySlugService(String(slug), req.log);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Blog Post fetched successfully",
            data
        })
    },

    getBlogsByUser : async (req : Request, res : Response) => {
        const { username } = req.params;
        const query = queryParser(req);

        if(!username){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No username found in the request")
        }

        const { data, meta } = await publicBlogService.getBlogsByUserService(String(username), query , req.log)

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Blog Posts fetched successfully",
            data,
            meta
        })
    },

    getFeed : async (req : Request, res : Response) => {
        throw new ApiError(HTTP_STATUS.NOT_IMPLEMENTED, "Feed endpoint not implemented yet")
    }
}
