import type { CursorPaginationMeta, OffsetPaginationMeta } from "./sendResponse";

export function cursorPaginate<T>(
  itemsPlusOne: T[],
  limit: number,
  getCursor: (item: T) => number
): { data: T[]; meta: CursorPaginationMeta } {
  const hasNextPage = itemsPlusOne.length > limit;
  const data = hasNextPage ? itemsPlusOne.slice(0, limit) : itemsPlusOne;
  const nextCursor =
    hasNextPage && data.length > 0 ? getCursor(data[data.length - 1]) : null;

  return {
    data,
    meta: {
      mode: "cursor",
      limit,
      nextCursor,
      hasNextPage,
    },
  };
}

export function 
offsetPaginate<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): { data: T[]; meta: OffsetPaginationMeta } {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasPrevPage = page > 1;
  const hasNextPage = page * limit < total;

  return {
    data: items,
    meta: {
      mode: "offset",
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
}
