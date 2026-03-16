import { Router } from "express";
import { asyncHanlder } from "../../utils/asyncHandler";
import { authController } from "./auth.controllers";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post('/sign-up', asyncHanlder(authController.signUp));
router.post('/login', asyncHanlder(authController.login));
router.post('/send-otp', asyncHanlder(authController.sendOTP));
router.post('/verify-otp', asyncHanlder(authController.verifyOTP));
router.post('/refresh', asyncHanlder(authController.refreshToken));
router.post('/forgot-password', asyncHanlder(authController.forgotPassword));
router.post('/reset-password', asyncHanlder(authController.resetPassword));
router.post('/logout', asyncHanlder(authController.logout));
router.post('/logout-all', authMiddleware, asyncHanlder(authController.logoutAll))

export default router;