import dotenv from 'dotenv';
import {z} from 'zod';

dotenv.config();

const envSchema = z.object({
    SECRET_KEY : z.string(),
    PORT : z.coerce.number().default(8000)
})

const env  = envSchema.parse(process.env)

export const JWT_KEY = env.SECRET_KEY;
export const PORT = env.PORT;