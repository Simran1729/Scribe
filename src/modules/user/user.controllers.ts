import { Request, Response } from "express";
import { updateProfileSchema } from "./user.schema";
import { userService } from "./user.services";
import { sendResponse } from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constants/httpStatus";

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

    }, 

    promoteDemoteUser : async (req : Request, res : Response) => {

    }, 

    blockUser : async (req : Request, res : Response) => {

    }, 
     
    deactivateUser : async (req : Request, res : Response) => {

    }
}