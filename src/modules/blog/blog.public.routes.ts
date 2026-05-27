import { Router } from "express";

const router = Router();

//get a blog post by id 
router.get('/:id', )

//get a blog post by slug
router.get('/:slug')

// get blog posts for a user
router.get('/:userId/blogs')

// I want to create a custom feed if user is logged in then custom feed, and if not then general feed
router.get('/feed');

export default router;