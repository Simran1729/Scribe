import { Request } from "express";


export interface queryRes {
    search : string | null,
    order : "asc" | "desc",
    cursor : string | null,
    limit : number,
    sortBy : string 
} 

export function queryParser (req : Request) : queryRes {
    const { query } = req;

    let limit = Number(query.limit);
    if (isNaN(limit) || limit <= 0) limit = 10;
    if (limit > 20) limit = 20;

    
  return {
    search: typeof query.search === "string" ? query.search : null,
    limit,
    cursor: typeof query.cursor === "string" ? query.cursor : null,
    sortBy: typeof query.sortBy === "string" ? query.sortBy : "createdAt",
    order: query.order === "asc" ? "asc" : "desc",
  };

} 