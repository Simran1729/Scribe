import {email, z} from 'zod';

export const signUpSchema = z.object({
    email : z.email("Email is required"),
    name : z.string().min(2, "Name is required"),
    password : z.string().min(8, "Password must be atleast 8 characters")
})

export const LoginSchema = z.object({
    email : z.email("Email is required"),
    password : z.string().min(8, "Password must be atleast 8 characters")
})

export const userResponseSchema = z.object({
    id : z.number(),
    name : z.string(),
    email : z.email(),
    role : z.enum(["ADMIN", "MODERATOR", "USER"])
})

export const sendOTPSchema = LoginSchema.omit({
    "password" : true
});

export const verifyOTPSchema = sendOTPSchema.extend({
    otp : z.string().min(6, "OTP must be six digits")
})

export const refreshTokenSchema = z.string();
export const forgotPasswordSchema = sendOTPSchema;

export const resetPasswordSchema = z.object({
    token : z.string(),
    password : z.string().min(8, "Password must be atleast 8 characters")
})
