import { z } from "zod";
import { Prisma } from "@prisma/client";

export const blogSchema = z.object({
    userId: z.number(),
    enrichedText: z.json()
});

export type createBlogDTO = z.infer<typeof blogSchema>;
