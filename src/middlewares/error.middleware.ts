import { ErrorRequestHandler } from "express"
import { zodErrorHandler } from "../utils/zodErrorHandler"
import { prismaErrorHandler } from "../utils/prismaErrorHandler";
import { ApiError } from "../utils/ApiError";
import { sendResponse } from "../utils/sendResponse";

export const errorMiddleware : ErrorRequestHandler  = ( err, req, res , next) => {
    let error = zodErrorHandler(err);
    error = prismaErrorHandler(error);

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