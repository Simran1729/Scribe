import { Router } from "express";

import authorRoutes from "./blog.author.routes"
import adminBlogRoutes from "../blog/blog.admin.routes"
import publicBlogRoutes from "../blog/blog.public.routes"

const router = Router();

router.use('/', authorRoutes);
router.use('/', adminBlogRoutes);
router.use('/', publicBlogRoutes);

export default router;