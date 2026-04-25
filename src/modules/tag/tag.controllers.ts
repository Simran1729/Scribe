import { Request, Response } from "express";
import { queryParser } from "../../utils/queryParser";
import { getTags } from "./tag.services";
import { sendResponse } from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constants/httpStatus";

export const tagController = {
    searchTags : async (req : Request, res : Response) =>{
        const query = queryParser(req);

        const { data, meta } = await getTags(query, req.log);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Tags fetched successfully",
            data,
            meta,
        })
    }
}
