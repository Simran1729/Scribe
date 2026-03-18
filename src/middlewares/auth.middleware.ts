import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { HTTP_STATUS } from "../constants/httpStatus";
import { TokenPayloadSchema, verifyToken } from "../utils/authUtils";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Authorization header missing");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Access token missing");
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;

    next();

  } catch {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid or expired token");
  }
};