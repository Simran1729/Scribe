import { prisma } from "../../lib/prisma";
import { createBlogDTO } from "./blog.schema";

export const blogService = {
    createBlogService: async (data: createBlogDTO): Promise<void> => {
        const { userId, slug, title, plainText, enrichedText, htmlText } = data;

        await prisma.blog.create({
            data: {
                userId,
                slug,
                title,
                plainText,
                enrichedText,
                htmlText,
            },
        });
    },
};
