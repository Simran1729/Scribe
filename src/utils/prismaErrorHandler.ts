import { Prisma } from "@prisma/client"
import { ApiError } from "./ApiError"
import { HTTP_STATUS } from "../constants/httpStatus"

export const prismaErrorHandler = (error : unknown) => {
    if(error instanceof Prisma.PrismaClientKnownRequestError){
        return new ApiError(HTTP_STATUS.BAD_REQUEST, "Database Operation Failed")
    }

    if(error instanceof Prisma.PrismaClientUnknownRequestError){
        return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Unknown Database Error")
    }

    if(error instanceof Prisma.PrismaClientValidationError){
        return new ApiError(HTTP_STATUS.BAD_REQUEST, "Validation Error")
    }

    return error;

}