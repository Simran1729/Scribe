import { HTTP_STATUS } from "../../constants/httpStatus";
import { ROLE_TRANSITIONS } from "../../constants/user.constants";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { comparePasswords, generateUsernameSuggestions, hashPassword, isValidUsername } from "../../modules/auth/auth.utils";
import { blockUserDTO, changePasswordDTO, deactivateUserDTO, promoteDemoteUserDTO, updateProfileDTO } from "./user.types";
import type { Logger } from "pino";
import { logger } from "../../utils/logger";
import { Prisma } from "@prisma/client";

const serviceLogger = logger.child({ service: "user" });

export const userService = {
    updateProfile : async (data : updateProfileDTO, userId : number, log : Logger = serviceLogger) : Promise<void> => {
        const user =  await prisma.user.findUnique({
            where : {
                id : userId
            },
            select : {
                id : true,
                isActive : true,
                username : true
            }
        })

        if(!user || !user.isActive){
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "User not Active or doesn't exist")
        }
          if (data.username && data.username !== user.username) {

            if (!isValidUsername(data.username)) {
                throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid username format")
            }

            const taken = await prisma.user.findFirst({
                where: {
                    username: data.username,
                    NOT     : { id: userId }
                },
                select: { id: true }
            })

            if (taken) {
            throw new ApiError(HTTP_STATUS.CONFLICT, "Username already taken")
            }

            // update username on User model
            // P2002 guard for race condition
            try {
            await prisma.user.update({
                where: { id: userId },
                data : { username: data.username }
            })
            } catch (err) {
            if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === "P2002"
            ) {
                throw new ApiError(HTTP_STATUS.CONFLICT, "Username just got taken, please try another")
            }
            throw err
            }
        }
        
        const {username, ...profileData} = data;
        await prisma.profile.update({
            where : {
                userId : user.id
            },
            data : profileData
        })

        log.info({ userId }, "profile updated");
    },

    checkUsernameService: async (username: string, currentUserId: number, log : Logger = serviceLogger): Promise<{
        available   : boolean
        message     : string
        suggestions : string[]
    }> => {

        log.info({
            username,
            currentUserId
        }, "Checking username availability")

        if (!isValidUsername(username)) {
            return {
            available   : false,
            message     : "3-20 chars, lowercase letters, numbers, underscores only",
            suggestions : []
            }
        }

        const currentUser = await prisma.user.findUnique({
            where : { id: currentUserId },
            select: { username: true }
        })

        if (currentUser?.username === username) {
            return {
            available   : true,
            message     : "This is your current username",
            suggestions : []
            }
        }

        const existing = await prisma.user.findUnique({
            where : { username },
            select: { id: true }
        })

        if (!existing) {
            return {
            available   : true,
            message     : "Username available",
            suggestions : []
            }
        }

        const suggestions = await generateUsernameSuggestions(username)

        return {
            available   : false,
            message     : "Username already taken",
            suggestions
        }
    },

    changePassword : async (data : changePasswordDTO , userId : number, log : Logger = serviceLogger) : Promise<void> => {
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

        log.info({ userId }, "password changed");
    },

    promoteDemoteUser : async (data : promoteDemoteUserDTO, log : Logger = serviceLogger) => {
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

        log.info(
            { targetUserId: data.userId, action: data.action, toRole: transition.TO },
            "role updated"
        );
        
    },

    blockUser : async(data : blockUserDTO, log : Logger = serviceLogger) : Promise<void> => {
        const {id, type} = data;

        const user = await prisma.user.findUnique({
            where : {
                id : id
            }
        })

        if(!user){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No Active user Found")
        }

        if(type === user.isBlocked){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Request, User already in requrest state")
        }

        await prisma.user.update({
            where : {
                id : id
            },
            data : {
                isBlocked : type
            }
        })

        log.info({ targetUserId: id, isBlocked: type }, "user block updated");
    },

    deactivateUser : async(data : deactivateUserDTO, log : Logger = serviceLogger) : Promise<void> => {
        const {id, type} = data;

        const user = await prisma.user.findUnique({
            where : {
                id : id
            }
        })

        if(!user){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No Active user Found")
        }

        if(type === user.isActive){
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Request, User already in requrest state")
        }

        await prisma.user.update({
            where : {
                id : id
            },
            data : {
                isActive : type
            }
        })

        log.info({ targetUserId: id, isActive: type }, "user active updated");
    } 
}
