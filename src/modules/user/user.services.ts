import { HTTP_STATUS } from "../../constants/httpStatus";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { updateProfileDTO } from "./user.types";

export const userService = {
    updateProfile : async (data : updateProfileDTO, userId : number) => {
        const user =  await prisma.user.findUnique({
            where : {
                id : userId
            }
        })

        if(!user || !user.isActive){
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "User not Active or doesn't exist")
        }
        
        await prisma.user.update({
            where : {
                id : user.id
            },
            data : data
        })
    }
}