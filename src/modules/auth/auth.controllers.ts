import { Request, Response } from "express";
import { signUpSchema } from "./auth.schema";
import { authService } from "./auth.services";
import { sendResponse } from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constants/httpStatus";


export const authController = {
    signUp : async (req : Request, res : Response) => {
        const parsedBody = signUpSchema.parse(req.body);

        const user = await authService.createUser(parsedBody);

        sendResponse(res, HTTP_STATUS.CREATED, {
            status : true,
            message : "User Created Successfully",
            data : user
        })
    }
}