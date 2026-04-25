import { prisma } from "../../lib/prisma"
import { queryRes } from "../../utils/queryParser"
import type { Prisma } from "@prisma/client";
import type { Logger } from "pino";
import { logger } from "../../utils/logger";
import { cursorPaginate, offsetPaginate } from "../../utils/pagination";
import type { PaginationMeta } from "../../utils/sendResponse";

const serviceLogger = logger.child({ service: "tag" });

type TagResponseDTO = {
    id : number,
    name : string
}


export const getTags = async (
    query : queryRes,
    log : Logger = serviceLogger
) : Promise<{ data: TagResponseDTO[]; meta: PaginationMeta }> => {
    const {search, order, cursor, limit, sortBy, mode: requestedMode, page} = query;
    const mode = requestedMode ?? "offset";

    const allowedSortFields = ["createdAt", "name"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const where: Prisma.TagWhereInput | undefined = search ? {
        name : {
            contains : search,
            mode : "insensitive"
        }
    } : undefined;

    const orderBy: Prisma.TagOrderByWithRelationInput[] = [
        { [safeSortBy] : order } as Prisma.TagOrderByWithRelationInput,
        { id: order }
    ];

    if (mode === "cursor") {
        const rows = await prisma.tag.findMany({
            where,
            orderBy,
            take : limit + 1,
            ...(cursor && {
                cursor : {id : Number(cursor)},
                skip : 1
            }),
            select : {
                id : true,
                name : true
            }
        });

        const { data, meta } = cursorPaginate(rows, limit, (t) => t.id);

        log.info(
            { mode, hasSearch: Boolean(search), sortBy: safeSortBy, order, limit, cursor, returned: data.length, hasNextPage: meta.hasNextPage },
            "tags fetched"
        );
        return { data, meta };
    }

    // default for tags: offset/page based pagination
    const skip = (page - 1) * limit;
    const [total, rows] = await prisma.$transaction([
        prisma.tag.count({ where }),
        prisma.tag.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            select : {
                id : true,
                name : true
            }
        })
    ]);

    const { data, meta } = offsetPaginate(rows, page, limit, total);

    log.info(
        { mode: "offset", hasSearch: Boolean(search), sortBy: safeSortBy, order, page, limit, returned: data.length, total, hasNextPage: meta.hasNextPage },
        "tags fetched"
    );
    return { data, meta };
}
