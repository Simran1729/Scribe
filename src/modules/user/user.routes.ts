import { Router } from "express";
import { asyncHanlder } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { userController } from "./user.controllers";

const router = Router();

router.post('/update-profile', authMiddleware, asyncHanlder(userController.updateProfile));
// router.post('/change-password');
// router.post('/promote-demote-user');
// router.post('/block-user');
// router.post('/deactivate-account');


export default router;