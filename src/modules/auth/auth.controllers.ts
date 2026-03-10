import { Request, Response } from "express";
import { LoginSchema, sendOTPSchema, signUpSchema } from "./auth.schema";
import { authService } from "./auth.services";
import { sendResponse } from "../../utils/sendResponse";
import { HTTP_STATUS, TOKEN_EXPIRY } from "../../constants/httpStatus";
import { addDays } from "date-fns";

export const authController = {
    signUp : async (req : Request, res : Response) => {
        const parsedBody = signUpSchema.parse(req.body);

        const {user, accessToken, refreshToken} = await authService.createUser(parsedBody);

        res.cookie('refreshToken', refreshToken, {
            httpOnly : true,
            sameSite : "lax",
            secure : false,
            expires : addDays(new Date(), TOKEN_EXPIRY.REFRESH_TOKEN_DAYS)
        })

        sendResponse(res, HTTP_STATUS.CREATED, {
            status : true,
            message : "User Created Successfully",
            data : {user, accessToken}
        })
    }, 
    login : async(req : Request, res : Response) => {
        const parsed = LoginSchema.parse(req.body);
        
        const {user, accessToken, refreshToken} = await authService.loginUser(parsed)

        res.cookie('refreshToken', refreshToken,{
            httpOnly : true,
            sameSite : "lax",
            secure : false,
            expires : addDays(new Date(), TOKEN_EXPIRY.REFRESH_TOKEN_DAYS)
        } )

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Login Successful",
            data : {user, accessToken}
        })
    },
    sendOTP : async(req: Request, res : Response) => {
        const parsed = sendOTPSchema.parse(req.body);

        await authService.sendOtp(parsed);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "OTP sent successfully"
        })
    }
}