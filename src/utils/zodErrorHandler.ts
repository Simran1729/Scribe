import { formatError, ZodError } from "zod"
import { ApiError } from "./ApiError";
import { HTTP_STATUS } from "../constants/httpStatus";

export const zodErrorHandler = (error : unknown) => {
    if(error instanceof ZodError){
        const formattedErrors = error.issues.map(issue => ({
            field : issue.path.join("."), 
            message : issue.message
        }));

        return new ApiError(HTTP_STATUS.BAD_REQUEST, "Validation Failed", formattedErrors);
    }
    return error;
}