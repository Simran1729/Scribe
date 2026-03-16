import {z} from "zod";
import { forgotPasswordSchema, LoginSchema, logoutAllSchema, logoutSchema, refreshTokenSchema, resetPasswordSchema, sendOTPSchema, signUpSchema, userResponseSchema, verifyOTPSchema } from "./auth.schema";
import { Request } from "express";
import { TokenPayload } from "../../utils/authUtils";

export type SignUpDTO = z.infer<typeof signUpSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type userResponseDTO = z.infer<typeof userResponseSchema>;
export type sendOtpDTO = z.infer<typeof sendOTPSchema>;
export type verifyOtpDTO = z.infer<typeof verifyOTPSchema>;
export type refreshTokenDTO = z.infer<typeof refreshTokenSchema>;
export type forgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type resetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type logoutDTO = z.infer<typeof logoutSchema>;
export type logoutAllDTO = z.infer<typeof logoutAllSchema>;

export interface AuthRequest extends Request {
  user: TokenPayload;
}