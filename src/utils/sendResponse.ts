/*

{
    status : boolean  // api kaam kri ya nhi
    message : string  // toast for frontend
    data ?: {},  // if status is true
    meta ? : {} // if paginated response
    error ?: {}  // if statu is false
}

*/

import { Response } from "express";

export type CursorPaginationMeta = {
    mode: "cursor";
    limit: number;
    nextCursor: number | null;
    hasNextPage: boolean;
};

export type OffsetPaginationMeta = {
    mode: "offset";
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

export type PaginationMeta = CursorPaginationMeta | OffsetPaginationMeta;

interface ApiResponse<T, TMeta = unknown>{
    status : boolean,
    message : string,
    data ?: T,
    meta?: TMeta,
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
        ...(options.meta ? {meta : options.meta} : {}),
        ...(options.error ? {error : options.error} : {}),
    })
}
