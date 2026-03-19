import { Router } from "express";
import { asyncHanlder } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { userController } from "./user.controllers";

const router = Router();

router.post('/update-profile', authMiddleware, asyncHanlder(userController.updateProfile));
router.post('/change-password', authMiddleware, asyncHanlder(userController.changePassword));
router.post('/promote-demote-user', authMiddleware, asyncHanlder(userController.promoteDemoteUser));
router.post('/block-user', authMiddleware, asyncHanlder(userController.blockUser));
router.post('/deactivate-account', authMiddleware, asyncHanlder(userController.deactivateUser));

export default router;