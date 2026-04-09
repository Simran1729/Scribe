import { Router } from "express";
import { asyncHanlder } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { userController } from "./user.controllers";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { USER_ROLES } from "../../constants/httpStatus";

const router = Router();

router.post('/update-profile', authMiddleware, asyncHanlder(userController.updateProfile));
router.post('/change-password', authMiddleware, asyncHanlder(userController.changePassword));
router.post('/deactivate-account', authMiddleware, asyncHanlder(userController.deactivateUser));
router.post('/promote-demote-user', authMiddleware, roleMiddleware(USER_ROLES.ADMIN, USER_ROLES.MODERATOR), asyncHanlder(userController.promoteDemoteUser));
router.post('/block-user', authMiddleware, roleMiddleware(USER_ROLES.ADMIN, USER_ROLES.MODERATOR), asyncHanlder(userController.blockUser));

export default router;