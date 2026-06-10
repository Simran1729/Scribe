import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { userController } from "./user.controllers";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { USER_ROLES } from "../../constants/httpStatus";

const router = Router();

router.post('/update-profile', authMiddleware, asyncHandler(userController.updateProfile));
router.get  ('/check-username',  authMiddleware, asyncHandler(userController.checkUsername))
router.post('/change-password', authMiddleware, asyncHandler(userController.changePassword));
router.post('/deactivate-account', authMiddleware, asyncHandler(userController.deactivateUser));

// ADMIN ROUTES
router.post('/promote-demote-user', authMiddleware, roleMiddleware(USER_ROLES.ADMIN, USER_ROLES.MODERATOR), asyncHandler(userController.promoteDemoteUser));
router.post('/block-user', authMiddleware, roleMiddleware(USER_ROLES.ADMIN, USER_ROLES.MODERATOR), asyncHandler(userController.blockUser));

export default router;