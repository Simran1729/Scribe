import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { tagController } from "./tag.controllers";

const router = Router();

router.get("/get", authMiddleware, asyncHandler(tagController.searchTags));

export default router;