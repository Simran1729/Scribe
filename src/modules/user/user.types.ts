import {z} from "zod";
import { blockUserSchema, changePasswordSchema, deactivateUserSchema, promoteDemoteUserSchema, updateProfileSchema } from "./user.schema";

export type updateProfileDTO = z.infer<typeof updateProfileSchema>
export type changePasswordDTO = z.infer<typeof changePasswordSchema>
export type promoteDemoteUserDTO = z.infer<typeof promoteDemoteUserSchema>
export type blockUserDTO = z.infer<typeof blockUserSchema>
export type deactivateUserDTO = z.infer<typeof deactivateUserSchema>