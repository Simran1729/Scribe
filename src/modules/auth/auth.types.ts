import {z} from "zod";
import { LoginSchema, signUpSchema } from "./auth.schema";

export interface ForgotPasswordDTO {
    email : string
}

export interface ChangePassword{
    email : string,
    oldPassword : string,
    newPassword : string
}

export type SignUpDTO = z.infer<typeof signUpSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;

// const schema = z.object({
//   email: z.string().email().transform(v => v.toLowerCase())
// });