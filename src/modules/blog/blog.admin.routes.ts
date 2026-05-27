import { Router } from "express";

const router = Router();

router.patch('/:id/block');
router.patch('/:id/unblock');

export default router;