import { Router } from "express";
import authRoutes from "../../modules/auth/auth.routes";
import userRoutes from "../../modules/user/user.routes";
import tagRoutes from "../../modules/tag/tag.routes";
import blogRoutes from "../../modules/blog/blog.routes";

const router = Router();

router.use("/auth", authRoutes); 
router.use("/user", userRoutes);
router.use("/tag", tagRoutes );
router.use("/blog", blogRoutes);

export default router;