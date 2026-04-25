import { ErrorRequestHandler } from "express"
import { zodErrorHandler } from "../utils/zodErrorHandler"
import { prismaErrorHandler } from "../utils/prismaErrorHandler";
import { ApiError } from "../utils/ApiError";
import { sendResponse } from "../utils/sendResponse";
import { logger } from "../utils/logger";

export const errorMiddleware : ErrorRequestHandler  = ( err, req, res , next) => {
    let error = zodErrorHandler(err);
    error = prismaErrorHandler(error);

    if(error instanceof ApiError){
        (req.log ?? logger).warn(
            { err: error, statusCode: error.statusCode },
            "request failed"
        );
        return sendResponse(res, error.statusCode, {
            status : false,
            message : error.message,
            error : error.errors
        })
    }

    (req.log ?? logger).error({ err: error }, "unhandled error");
    return sendResponse(res, 500, {
        status : false,
        message : "Internal Server Error"
    })
}
