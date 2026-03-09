import { addDays } from "date-fns";
import { HTTP_STATUS, TOKEN_EXPIRY, USER_ROLES } from "../../constants/httpStatus";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { comparePasswords, generateToken, hashPassword } from "../../utils/authUtils";
import { userResponseSchema } from "./auth.schema";
import { LoginDTO, SignUpDTO, userResponseDTO } from "./auth.types";

export const authService  = {
    createUser : async(data : SignUpDTO) : Promise<{
        user : userResponseDTO
        accessToken : string,
        refreshToken : string
    }> => {
        const existingUser = await prisma.user.findUnique({
            where : {
                email : data.email
            }
        })

        if(existingUser){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "User with this email already exists")
        }

        const hashedPassword = await hashPassword(data.password);
        const newUser = await prisma.$transaction(async (tx) => {
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

                const payload = {
                    id : user.id,
                    email : data.email,
                    role : USER_ROLES.USER
                }

                const accessToken = generateToken(payload, TOKEN_EXPIRY.ACCESS_TOKEN);
                const refreshToken = generateToken(payload, TOKEN_EXPIRY.REFRESH_TOKEN);

                await tx.token.create({
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
        })

        return newUser;
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

        if(!user){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found with this email")
        };

        const mathced = await comparePasswords(password, user.password);
        if(!mathced){
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Passwords didnt match");
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

    }
}