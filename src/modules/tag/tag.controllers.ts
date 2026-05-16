import { Request, Response } from "express";
import { queryParser } from "../../utils/queryParser";
import { getTags , createTag } from "./tag.services";
import { sendResponse } from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { ApiError } from "../../utils/ApiError";
import { z } from "zod";

const tagScehma = z.string().min(2).max(15);

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
    }, 

    createTags : async (req : Request, res : Response) => {
        const { tag } = req.body;

        const parsedData = tagScehma.parse(tag);

        if(!tag) { 
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Please provide a valid tag")   
        }
    
        const data = await createTag(parsedData, req.log);

        sendResponse(res, HTTP_STATUS.OK,{
            status : true,
            message : "Tag created successfully",
            data
        })
    }
}
