import {z} from 'zod';

export const signUpSchema = z.object({
    email : z.email("Email is required"),
    name : z.string().min(2, "Name is required"),
    password : z.string().min(8, "Password must be atleast 8 characters")
})

export const LoginSchema = z.object({
    email : z.email("Email is required"),
    password : z.string().min(8, "Password must be atleast 8 characters")
})