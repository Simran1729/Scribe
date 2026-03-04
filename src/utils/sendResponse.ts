/*

{
    status : boolean  // api kaam kri ya nhi
    message : string  // toast for frontend
    data ?: {},  // if status is true
    error ?: {}  // if statu is false
}

*/

import { Response } from "express";

interface ApiResponse<T>{
    status : boolean,
    message : string,
    data ?: T,
    error ?: unknown;
}

export const sendResponse =  <T>(
    res : Response,
    statusCode : number,
    options : ApiResponse<T>
) => {
    return res.status(statusCode).json({
        status : options.status,
        message : options.message,
        ...(options.data ? {data : options.data} : {}),
        ...(options.error ? {error : options.error} : {}),
    })
}