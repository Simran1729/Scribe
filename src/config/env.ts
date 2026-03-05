import dotenv from 'dotenv';
import {z} from 'zod';

dotenv.config();

const envSchema = z.object({
    SECRET_KEY : z.string()
})

const env  = envSchema.parse(process.env)

export const JWT_KEY = env.SECRET_KEY;