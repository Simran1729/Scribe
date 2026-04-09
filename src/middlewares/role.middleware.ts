import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { HTTP_STATUS } from "../constants/httpStatus";


export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role) {
      return next(
        new ApiError(HTTP_STATUS.BAD_REQUEST, "Role missing in request")
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(HTTP_STATUS.FORBIDDEN, "Insufficient permissions")
      );
    }

    next();
  };
};