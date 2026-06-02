import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { USER_ROLES } from "../../constants/httpStatus";
import { asyncHandler } from "../../utils/asyncHandler";
import { blogAdminController } from "./blog.admin.controllers";

const router = Router();

router.patch('/:id/block', authMiddleware, roleMiddleware(USER_ROLES.ADMIN, USER_ROLES.MODERATOR), asyncHandler(blogAdminController.blockBlogPost));
router.patch('/:id/unblock', authMiddleware, roleMiddleware(USER_ROLES.ADMIN, USER_ROLES.MODERATOR), asyncHandler(blogAdminController.unBlockBlogPost));

export default router;