import { z } from "zod";
import { BlogStatus, Prisma } from "@prisma/client";

export const blogSchema = z.object({
    userId: z.number(),
    enrichedText: z.json()
});


export const DraftBlogSchema = z.object({
    id : z.number(),
    userId : z.number(),
    enrichedText : z.json(),
    version : z.number(),
    status : BlogStatus,
    createdAt : z.string(),
    updatedAt : z.string().optional(),
})

export type DraftBlogDTO = z.infer<typeof DraftBlogSchema>;

export type createBlogDTO = z.infer<typeof blogSchema>;
