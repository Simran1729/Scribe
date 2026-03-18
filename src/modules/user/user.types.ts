import {z} from "zod";
import { changePasswordSchema, promoteDemoteUserSchema, updateProfileSchema } from "./user.schema";

export type updateProfileDTO = z.infer<typeof updateProfileSchema>
export type changePasswordDTO = z.infer<typeof changePasswordSchema>
export type promoteDemoteUserDTO = z.infer<typeof promoteDemoteUserSchema>