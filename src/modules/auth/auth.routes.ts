import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authController } from "./auth.controllers";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post('/sign-up', asyncHandler(authController.signUp));
router.post('/login', asyncHandler(authController.login));
router.post('/send-otp', asyncHandler(authController.sendOTP));
router.post('/verify-otp', asyncHandler(authController.verifyOTP));
router.post('/refresh', asyncHandler(authController.refreshToken));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));
router.post('/logout', asyncHandler(authController.logout));
router.post('/logout-all', authMiddleware, asyncHandler(authController.logoutAll));
export default router;