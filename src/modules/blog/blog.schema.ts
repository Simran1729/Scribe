import { number, z } from "zod";
import { Prisma } from "@prisma/client";
import { BlogStatus } from "../../constants/blog.constants";

export const blogSchema = z.object({
    userId: z.number(),
    enrichedText: z.custom<Prisma.JsonValue>()
});


export const DraftBlogSchema = z.object({
    id: z.number(),
    userId: z.number(),
    enrichedText: z.custom<Prisma.JsonValue>(),
    version: z.number(),
    status: z.enum(BlogStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export const autoSaveDraftSchema = z.object({
    enrichedText: z.custom<Prisma.InputJsonValue>(),
    version: z.number()
})

export const publishDraftSchema = z.object({
    id : z.number(),
    userId : z.number(),
    tags : z.array(z.number())
})

export type createBlogDTO = z.infer<typeof blogSchema>;
export type DraftBlogDTO = z.infer<typeof DraftBlogSchema>;
export type publishDraftDTO = z.infer<typeof publishDraftSchema>;
