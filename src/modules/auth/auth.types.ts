import {z} from "zod";
import { forgotPasswordSchema, LoginSchema, refreshTokenSchema, resetPasswordSchema, sendOTPSchema, signUpSchema, userResponseSchema, verifyOTPSchema } from "./auth.schema";


export interface ChangePassword{
    email : string,
    oldPassword : string,
    newPassword : string
}

export type SignUpDTO = z.infer<typeof signUpSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type userResponseDTO = z.infer<typeof userResponseSchema>;
export type sendOtpDTO = z.infer<typeof sendOTPSchema>;
export type verifyOtpDTO = z.infer<typeof verifyOTPSchema>;
export type refreshTokenDTO = z.infer<typeof refreshTokenSchema>;
export type forgotPasswordDTO = z.infer<typeof forgotPasswordSchema>
export type resetPasswordDTO = z.infer<typeof resetPasswordSchema>

// const schema = z.object({
//   email: z.string().email().transform(v => v.toLowerCase())
// });