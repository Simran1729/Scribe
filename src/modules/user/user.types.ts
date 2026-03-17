import {z} from "zod";
import { updateProfileSchema } from "./user.schema";

export type updateProfileDTO = z.infer<typeof updateProfileSchema>