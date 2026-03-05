import { Request, Response } from "express";
import { signUpSchema } from "./auth.schema";


export const authController = {
    singUp : async (req : Request, res : Response) => {
        const body = req.body;
        const parsedBody = signUpSchema.parse(body);

        // const user = await auth
    }
}