import {z} from "zod";
import { VALID_ACTIONS } from "../../constants/user.constants";

export const updateProfileSchema = z.object({
    username : z.string().min(3).max(20).optional(),
    interests : z.string().optional(),
    about : z.string().optional(),
    occupation : z.string().optional()
}).refine(
    (data) => Object.values(data).some((val) => val !== undefined),
    {
        message: "At least one field must be provided"
    }
)


export const changePasswordSchema = z.object({
    oldPassword : z.string().min(8, "Password must be atleast 8 characters"),
    newPassword : z.string().min(8, "Password must be atleast 8 characters")
})

export const promoteDemoteUserSchema = z.object({
    userId : z.number(),
    action : z.enum(VALID_ACTIONS)
})

export const blockUserSchema = z.object({
    id : z.number(),
    type : z.boolean()
})

export const usernameQuerySchema = z.object({
    username: z
        .string("Username is required" )
        .min(1, "Username cannot be empty")
        .trim()
})
export const deactivateUserSchema = blockUserSchema;
