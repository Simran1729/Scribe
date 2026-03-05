import { Router } from "express";

export const router = Router();

router.post('/sign-up');
router.post('/login');
router.post('/send-otp');
router.post('/verify-otp');
router.post('/refresh');
router.post('/change-password');
router.post('/forgot-password');
router.post('/reset-password')