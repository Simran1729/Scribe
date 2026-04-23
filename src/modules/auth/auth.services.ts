import { addDays, addMinutes } from "date-fns";
import { HTTP_STATUS, TOKEN_EXPIRY, USER_ROLES } from "../../constants/httpStatus";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { comparePasswords, generateOTP, generateToken, hashPassword, verifyToken } from "../../utils/authUtils";
import { userResponseSchema } from "./auth.schema";
import { forgotPasswordDTO, LoginDTO, logoutAllDTO, logoutDTO, refreshTokenDTO, resetPasswordDTO, sendOtpDTO, SignUpDTO, userResponseDTO, verifyOtpDTO } from "./auth.types";
import { sendEmail } from "../../utils/sendMail";
import { otpTemplate, passwordResetTemplate } from "../../utils/emailTemplates";

export const authService  = {
        createUser : async(data : SignUpDTO) : Promise<void> => {
        const existingUser = await prisma.user.findUnique({
            where : {
                email : data.email
            }
        })

        if(existingUser){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "User with this email already exists")
        }

        const hashedPassword = await hashPassword(data.password);
        await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                data : {
                        name : data.name,
                        email : data.email,
                        password : hashedPassword,
                        role : USER_ROLES.USER,
                        profile : {
                            create : {} 
                        }, 
                    }
                })

                const otp = generateOTP();
                await tx.emailOTP.create({
                    data : {
                        otp : otp,
                        userId : user.id,
                        expiresAt : addMinutes(new Date(), 5)
                    }
                })

                await sendEmail({
                    to : user.email,
                    subject : "OTP from Scribe",
                    html : otpTemplate(otp) 
                })
        })

    },

    loginUser : async(data : LoginDTO) : Promise<{
        user : userResponseDTO,
        accessToken : string,
        refreshToken : string
    }> => {
        const {email, password} = data;

        const user = await prisma.user.findUnique({
            where : {
                email : email
            }
        })

        if(!user || !user.isActive || user.isBlocked){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found with this email")
        };

        if(!user.isEmailVerified){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "First verify email first")
        }

        const mathced = await comparePasswords(password, user.password);
        if(!mathced){
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid Password");
        }

        const payload = {
            id : user.id,
            email : user.email,
            role : user.role
        }

        const accessToken = generateToken(payload, TOKEN_EXPIRY.ACCESS_TOKEN);
        const refreshToken = generateToken(payload, TOKEN_EXPIRY.REFRESH_TOKEN);

        await prisma.token.create({
            data : {
                token : refreshToken,
                expiresAt : addDays(new Date(), TOKEN_EXPIRY.REFRESH_TOKEN_DAYS),
                userId : user.id
            }
        })

        return {
            user : userResponseSchema.parse(user),
            accessToken,
            refreshToken
        }

    },

    sendOtp : async (data: sendOtpDTO) : Promise<void>  => {
        const userExists = await prisma.user.findUnique({
            where : {
                email : data.email
            }
        })

        if(!userExists){
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "User doesnt exist with this email");
        }

        await prisma.emailOTP.deleteMany({
            where : {
                userId : userExists.id
            }
        })

        const otp = generateOTP();
        await prisma.emailOTP.create({
            data : {
                otp : otp,
                userId : userExists.id,
                expiresAt : addMinutes(new Date(), 5)
            }
        })

        await sendEmail({
            to : userExists.email,
            subject : "OTP from Scribe",
            html : otpTemplate(otp) 
        })

    },

    verifyOtp : async (data : verifyOtpDTO) : Promise<{
        user : userResponseDTO,
        accessToken : string,
        refreshToken : string
    }> =>{
        const {email, otp} = data;

        const userExists = await prisma.user.findUnique({
            where : {
                email : email
            }
        })

        if(!userExists){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "User doesn't exist with this email")
        }

        const result = await prisma.emailOTP.findFirst({
            where : {
                userId : userExists.id,
                otp : otp
            }
        })

        if(!result){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "OTP didn't match")
        }

        if(result.expiresAt < new Date()){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "OTP expired")
        }
        
        const payload = {
            id : userExists.id,
            email : data.email,
            role : USER_ROLES.USER
        }

        const accessToken = generateToken(payload, TOKEN_EXPIRY.ACCESS_TOKEN);
        const refreshToken = generateToken(payload, TOKEN_EXPIRY.REFRESH_TOKEN);

        await prisma.user.update({
            where : {
                id : userExists.id
            }, data : {
                isEmailVerified : true
            }
        })

        await prisma.token.create({
            data : {
                token : refreshToken,
                expiresAt : addDays(new Date(), TOKEN_EXPIRY.REFRESH_TOKEN_DAYS),
                userId : userExists.id
            }
        })

        const user = userResponseSchema.parse(userExists)
        return {user, accessToken, refreshToken}

    },

    refreshToken : async (token : refreshTokenDTO) : Promise<{
        accessToken : string,
        refreshToken : string,
        expiresAt : Date
    }> => {
        const tokenExist = await prisma.token.findUnique({
            where : {
                token : token,
            }
        })

        if(!tokenExist || tokenExist.expiresAt < new Date()){
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Session Expired, Login Again");
        }

        const decodedPayload = verifyToken(token);

        const accessToken = generateToken(decodedPayload, TOKEN_EXPIRY.ACCESS_TOKEN);
        const refreshToken = generateToken(decodedPayload, TOKEN_EXPIRY.REFRESH_TOKEN);

        await prisma.token.update({
            where : {
                token : token
            }, 
            data : {
                token : refreshToken
            }
        });

        return {
            accessToken, 
            refreshToken,
            expiresAt : tokenExist.expiresAt
        };
    }, 

    forgotPassword : async(data : forgotPasswordDTO) : Promise<void> => {
        const {email} = data;

        const userExist = await prisma.user.findUnique({
            where : {
                email : email
            }
        })

        if(!userExist || !userExist.isActive || userExist.isBlocked){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No Active user found with this mail")
        }
        const payload = {
            id : userExist.id,
            email : userExist.email,
            role : userExist.role
        }


        const token = generateToken(payload, TOKEN_EXPIRY.PASSWORD_TOKEN);

        await prisma.passwordResetToken.deleteMany({
            where : {
                userId : userExist.id
            }
        })
        await prisma.passwordResetToken.create({
            data : {
                userId : userExist.id,
                token : token,
                expiresAt : addMinutes(new Date(), 5)
            }
        })

        sendEmail({
            to : userExist.email,
            subject : "Password Reset Link",
            html : passwordResetTemplate(token)
        })

    }, 

    resetPassword : async(data : resetPasswordDTO) : Promise<void> => {
        const {token, password} = data;

        const tokenExist = await prisma.passwordResetToken.findUnique({
            where : {
                token : token
            }
        })

        if(!tokenExist || tokenExist.expiresAt < new Date()){
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "Token Expired")
        }

        const decodedPayload = verifyToken(token);
        const hash =  await hashPassword(password);

        await prisma.$transaction(async (tx) => {
                await tx.user.update({
                        where: { email: decodedPayload.email },
                        data: { password: hash }
                });

                await tx.passwordResetToken.deleteMany({
                        where: { userId: decodedPayload.id }
                });
        });

    }, 

    logout : async(token : logoutDTO) : Promise<void> => {
        await prisma.token.delete({
            where : {
                token : token
            }
        })


    }, 

    logoutAll : async(id : number) : Promise<void> => {

        const userExist = await prisma.user.findUnique({
            where : {
                id : id
            }
        })

        if(!userExist){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No user exist with this email")
        }

        await prisma.token.deleteMany({
            where : {
                userId : userExist.id
            }
        })

    }
}
