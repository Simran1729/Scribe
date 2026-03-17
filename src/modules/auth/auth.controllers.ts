import { Request, Response } from "express";
import { forgotPasswordSchema, LoginSchema, logoutAllSchema, logoutSchema, refreshTokenSchema, resetPasswordSchema, sendOTPSchema, signUpSchema, verifyOTPSchema } from "./auth.schema";
import { authService } from "./auth.services";
import { sendResponse } from "../../utils/sendResponse";
import { HTTP_STATUS, TOKEN_EXPIRY } from "../../constants/httpStatus";
import { addDays } from "date-fns";
import { ApiError } from "../../utils/ApiError";

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
    },
    verifyOTP : async(req: Request, res : Response) => {
        const parsed = verifyOTPSchema.parse(req.body);

        await authService.verifyOtp(parsed);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "OTP verified"
        })
    },
    refreshToken : async( req: Request , res : Response) => {
        const token = req.cookies.refreshToken;
        
        if(!token){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No token found in cookies")
        }

        const parsed = refreshTokenSchema.parse(token);
        
        const {accessToken, refreshToken, expiresAt} = await authService.refreshToken(parsed);

        res.cookie('refreshToken', refreshToken, {
            httpOnly : true,
            sameSite : "lax",
            secure : false,
            expires : expiresAt
        })

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Token refreshed",
            data : {accessToken}
        })
    },
    forgotPassword : async(req : Request, res : Response) => {
        const parsed = forgotPasswordSchema.parse(req.body);

        await authService.forgotPassword(parsed);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "An Email with Reset Link has been sent to your registered email"
        })
    }, 

    resetPassword : async (req : Request , res : Response) => {
        const parsed = resetPasswordSchema.parse(req.body);

        await authService.resetPassword(parsed);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true, 
            message : "Password Reset successful. Login Again"
        })
    },

    logout : async (req : Request, res : Response) => {
        const token = req.cookies.refreshToken;

        if(!token){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No token found in cookies")
        }

        const parsed = logoutSchema.parse(token);

        await authService.logout(parsed);

        res.clearCookie('refreshToken', {
                httpOnly: true,
                sameSite: "lax",
                secure: false
        });

        sendResponse(res, HTTP_STATUS.OK, {
            status: true, 
            message : "Logout Successful"
        })
    }, 

    logoutAll : async(req : Request, res : Response) => {
        // const parsed = logoutAllSchema.parse(req.user!.id);

        await authService.logoutAll(req.user!.id);

        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "User has been logged out of all the devices"
        } )
    }
}