import {z} from "zod";
import { LoginSchema, sendOTPSchema, signUpSchema, userResponseSchema } from "./auth.schema";

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
export type userResponseDTO = z.infer<typeof userResponseSchema>;
export type sendOtpDTO = z.infer<typeof sendOTPSchema>;


// const schema = z.object({
//   email: z.string().email().transform(v => v.toLowerCase())
// });