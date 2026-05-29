import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { blockBlogSchema } from "./blog.schema";
import { blogAdminService } from "./blog.admin.services";
import { ApiError } from "../../utils/ApiError";

export const blogAdminController = {
    blockBlogPost : async (req : Request, res: Response) => {
        const { id } = req.params;
        const { blockReason } = req.body;

        const userId = req.user?.id;

        const parsedData = blockBlogSchema.parse({
            id,
            userId,
            blockReason
        })

        await blogAdminService.blockBlogService(parsedData, req.log);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Blog Post blocked successfully"
        })
    },

    unBlockBlogPost : async (req : Request, res : Response) => {
        const { id } = req.params;

        if(!id){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No id found in the request")
        }

        await blogAdminService.unblockBlogService(Number(id), req.log);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Blog Post ublocked successfully"
        })
    }
}