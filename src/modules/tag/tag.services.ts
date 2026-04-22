import { prisma } from "../../lib/prisma"
import { queryRes } from "../../utils/queryParser"

type TagResponseDTO = {
    id : number,
    name : string
}


export const getTags = async (query : queryRes) : Promise<TagResponseDTO[]> => {
    const {search, order, cursor, limit, sortBy} = query;

    const allowedSortFields = ["createdAt", "name"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "CreatedAt";

    const tags = await prisma.tag.findMany({
        where : search ? 
        {
            name : {
                contains : search,
                mode : "insensitive"
            }
        } : undefined,
        orderBy : {
            [safeSortBy] : order
        }, 
        take : limit,
        ...(cursor && {
            cursor : {id : Number(cursor)},
            skip : 1
        }),
        select : {
            id : true,
            name : true     
        }
    })

    return tags;
}