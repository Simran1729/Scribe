import { Request } from "express";


export type PaginationMode = "cursor" | "offset";

export interface queryRes {
    search : string | null,
    order : "asc" | "desc",
    cursor : string | null,
    limit : number,
    sortBy : string,
    mode: PaginationMode | null,
    page: number
} 

export function queryParser (req : Request) : queryRes {
    const { query } = req;

    let limit = Number(query.limit);
    if (isNaN(limit) || limit <= 0) limit = 10;
    if (limit > 20) limit = 20;

    let page = Number(query.page);
    if (isNaN(page) || page <= 0) page = 1;

    const mode: PaginationMode | null =
      query.mode === "cursor" ? "cursor" : query.mode === "offset" ? "offset" : null;
    
  return {
    search: typeof query.search === "string" ? query.search : null,
    limit,
    cursor: typeof query.cursor === "string" ? query.cursor : null,
    sortBy: typeof query.sortBy === "string" ? query.sortBy : "createdAt",
    order: query.order === "asc" ? "asc" : "desc",
    mode,
    page,
  };

} 
