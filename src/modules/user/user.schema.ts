import {z} from "zod";

export const updateProfileSchema = z.object({
    interests : z.string().optional(),
    about : z.string().optional(),
    occupation : z.string().optional()
}).refine(
    (data) => Object.values(data).some((val) => val !== undefined),
    {
        message: "At least one field must be provided"
    }
)

