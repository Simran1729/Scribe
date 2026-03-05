import { HTTP_STATUS, USER_ROLES } from "../../constants/httpStatus";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { SignUpDTO } from "./auth.types";

export const authService  = {
    createUser : async(data : SignUpDTO) => {
        const existingUser = await prisma.user.findUnique({
            where : {
                email : data.email
            }
        })

        if(existingUser){
            return new ApiError(HTTP_STATUS.BAD_REQUEST, "User with this email already exists")
        }

        // const hashedPassword = had

        const payload = {
            email : data.email,
            role : USER_ROLES.USER
        }
    }
}