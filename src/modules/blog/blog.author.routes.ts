import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { blogController } from "./blog.author.controllers";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// ** UnPublished/Draft Blog = Draft
// ** Published Blog = BlogPost

// ** Draft Blog Routes **

router.post("/draft", authMiddleware, asyncHandler(blogController.createBlog));

router.get( "/draft/:id", authMiddleware, asyncHandler(blogController.getDraftById));

router.patch( "/draft/:id", authMiddleware, asyncHandler(blogController.autoSaveDraft));

router.delete( "/draft/:id", authMiddleware, asyncHandler(blogController.deleteDraft))

router.post( "/draft/:id/publish", authMiddleware, asyncHandler(blogController.publishDraft));

// ** Published Blog Routes **

router.get("/post/:id/edit", authMiddleware, asyncHandler(blogController.getEditableBlogPost));

router.patch("/post/:id", authMiddleware, asyncHandler(blogController.editBlogPost));

router.post("/post/:id/unlist", authMiddleware, asyncHandler(blogController.unlistBlogPost));

router.delete("/post/:id", authMiddleware, asyncHandler(blogController.deleteBlogPost));

router.post("/post/:id/relist", authMiddleware, asyncHandler(blogController.relistBlogPost));


// ** Common Routes **

router.get("/me/blogs", authMiddleware, asyncHandler(blogController.listMyBlogs));



export default router;
