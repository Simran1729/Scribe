import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHanlder } from "../../utils/asyncHandler";
import { tagController } from "./tag.controllers";

const router = Router();

router.get("/get", authMiddleware, asyncHanlder(tagController.searchTags));

export default router;