import { NextFunction, Response } from "express"
import { zodErrorHandler } from "../utils/zodErrorHandler"
import { prismaErrorHandler } from "../utils/prismaErrorHandler";
import { ApiError } from "../utils/ApiError";
import { sendResponse } from "../utils/sendResponse";

export const errorMiddleware  = (res : Response, req : Request, next : NextFunction, err : unknown) => {
    let error = zodErrorHandler(err);
    prismaErrorHandler(error);

    if(error instanceof ApiError){
        return sendResponse(res, error.statusCode, {
            status : false,
            message : error.message,
            error : error.errors
        })
    }

    console.error(error);
    return sendResponse(res, 500, {
        status : false,
        message : "Internal Server Error"
    })
}