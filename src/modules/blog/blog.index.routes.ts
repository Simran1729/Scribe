import { Router } from "express";

import blogRoutes from "../blog/blog.routes"
import adminBlogRoutes from "../blog/blog.admin.routes"
import publicBlogRoutes from "../blog/blog.public.routes"

const router = Router();

router.use('/', blogRoutes);
router.use('/', adminBlogRoutes);
router.use('/', publicBlogRoutes);

export default router;