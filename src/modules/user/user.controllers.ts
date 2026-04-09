import { Request, Response } from "express";
import { blockUserSchema, changePasswordSchema, deactivateUserSchema, promoteDemoteUserSchema, updateProfileSchema } from "./user.schema";
import { userService } from "./user.services";
import { sendResponse } from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { validateRole } from "../../utils/authUtils";
import { ApiError } from "../../utils/ApiError";


export const userController = {
    updateProfile : async(req : Request, res : Response) => {
        const parsed = updateProfileSchema.parse(req.body);

        await userService.updateProfile(parsed, req.user!.id);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Profile Updated Successfully"
        })
        
    }, 

    changePassword : async (req : Request, res : Response) => {
        const parsed = changePasswordSchema.parse(req.body);
        
        await userService.changePassword(parsed, req.user!.id);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Password change successful"
        })
    }, 

    promoteDemoteUser : async (req : Request, res : Response) => {
        if(!validateRole("ADMIN", req)){
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "User must be of admin role to perform this action")
        }

        const parsed = promoteDemoteUserSchema.parse(req.body);

        if(req.user!.id === parsed.userId){
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "User can't change their own role")
        }

        await userService.promoteDemoteUser(parsed);

        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "Role Transition Successful"
        })
    }, 

    blockUser : async (req : Request, res : Response) => {
        const data = blockUserSchema.parse(req.body);

        await userService.blockUser(data)
        sendResponse(res, HTTP_STATUS.OK, {
            status  : true, 
            message : "User Blocked successfully"
        })
    }, 
     
    deactivateUser : async (req : Request, res : Response) => {
        const data = deactivateUserSchema.parse(req.body);

        await userService.deactivateUser(data)
        sendResponse(res, HTTP_STATUS.OK, {
            status : true,
            message : "User Deactivated Successfully"
        })
    }
}