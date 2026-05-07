import { prisma } from "../../lib/prisma";
import { createBlogDTO } from "./blog.schema";

export const blogService = {
    createBlogService: async (data: createBlogDTO): Promise<void> => {
        const { userId, enrichedText } = data;

        await prisma.blog.create({
            data: {
                userId,
                enrichedText,
            },
        });
    },
};
