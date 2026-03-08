import { Router } from "express";
import { asyncHanlder } from "../../utils/asyncHandler";
import { authController } from "./auth.controllers";

const router = Router();

router.post('/sign-up', asyncHanlder(authController.signUp));
// router.post('/login');
// router.post('/send-otp');
// router.post('/verify-otp');
// router.post('/refresh');
// router.post('/change-password');
// router.post('/forgot-password');
// router.post('/reset-password');

export default router;