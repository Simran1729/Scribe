import slugify from "slugify";
import { queryParser, queryRes } from "../../utils/queryParser";
import { Request } from "express";

export const slugifyBlogTitle = (title : string) => {
    return slugify(title, {
        trim : true,
        lower : true,
        strict : true
    })
}

export interface blogQueryRes extends queryRes {
    status ?: "DRAFT" | "PUBLISHED" | "UNLISTED"
    isBlocked : boolean | undefined
}

export function blogQueryParser( req: Request) : blogQueryRes {
    const base = queryParser(req);

    return {
        ...base,
        status : ["DRAFT",  "PUBLISHED" , "UNLISTED"].includes(req.query.status as string)
        ? req.query.status as "DRAFT" | "PUBLISHED" | "UNLISTED" 
        : undefined,

        isBlocked : req.query.isBlocked !== undefined 
        ? req.query.isBlocked === "true"
        : undefined
    }
}