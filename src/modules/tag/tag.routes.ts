import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { tagController } from "./tag.controllers";

const router = Router();

router.get("/get", authMiddleware, asyncHandler(tagController.searchTags));
router.post("/create-tag", authMiddleware, asyncHandler(tagController.createTags));

export default router;