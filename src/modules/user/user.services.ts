import { HTTP_STATUS } from "../../constants/httpStatus";
import { ROLE_TRANSITIONS } from "../../constants/user.constants";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { comparePasswords, hashPassword } from "../../utils/authUtils";
import { changePasswordDTO, promoteDemoteUserDTO, updateProfileDTO } from "./user.types";

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
        
        await prisma.profile.update({
            where : {
                userId : user.id
            },
            data : data
        })
    },

    changePassword : async (data : changePasswordDTO , userId : number) => {
        const user = await prisma.user.findUnique({
            where : {
                id : userId
            }
        })

        if(!user || !user.isActive){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "User inactive or doesn't exist")
        }

        if(!comparePasswords(data.oldPassword, user.password)){
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "Passwords dont' match")
        }

        const newHash = await hashPassword(data.newPassword);

        await prisma.user.update({
            where :{
                id : userId
            },
            data : {
                password : newHash
            }
        })
    },

    promoteDemoteUser : async (data : promoteDemoteUserDTO) => {
        const transition = ROLE_TRANSITIONS[data.action];

        if(!transition){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid action. Use 'PROMOTE' or 'DEMOTE'.")
        }

        const targetUser = await prisma.user.findUnique({
            where : {
                id : data.userId
            }
        })

        if(!targetUser || !targetUser.isActive || !targetUser.isBlocked){
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "Target User not Found or Inactive")
        }

        if(targetUser.role != transition.FROM){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Action '${transition}' requires the user to have role ${transition.FROM}.`)
        }

        await prisma.user.update({
            where : {
                id : data.userId
            },
            data : {
                role : transition.TO
            }
        })
        
    }
}