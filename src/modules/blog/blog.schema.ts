import { z } from "zod";
import { Prisma } from "@prisma/client";

export const blogSchema = z.object({
    userId: z.number(),
    slug: z.string().min(1),
    title: z.string().min(1),
    plainText: z.string().min(1),
    enrichedText: z
        .json()
        .transform((value) =>
            value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue)
        ),
    htmlText: z.string().min(1),
});

export type createBlogDTO = z.infer<typeof blogSchema>;
