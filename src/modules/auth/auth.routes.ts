import { Router } from "express";
import { asyncHanlder } from "../../utils/asyncHandler";
import { authController } from "./auth.controllers";

const router = Router();

router.post('/sign-up', asyncHanlder(authController.signUp));
router.post('/login', asyncHanlder(authController.login));
router.post('/send-otp', asyncHanlder(authController.sendOTP));
router.post('/verify-otp', asyncHanlder(authController.verifyOTP));
// router.post('/refresh');
// router.post('/forgot-password');
// router.post('/reset-password');
// router.post('/logout');
// router.post('/logout-all')

export default router;