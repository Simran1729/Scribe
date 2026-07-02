import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { blogPublicController } from "./blog.public.controllers";

const router = Router();

//get a blog post by id 
router.get('/id/:id', asyncHandler(blogPublicController.getBlogById))

//get a blog post by slug
router.get('/slug/:slug', asyncHandler(blogPublicController.getBlogBySlug))

// get blog posts for a user
router.get('/users/:username/blogs', asyncHandler(blogPublicController.getBlogsByUser))

// I want to create a custom feed if user is logged in then custom feed, and if not then general feed
router.get('/feed', asyncHandler(blogPublicController.getFeed));

export default router;
