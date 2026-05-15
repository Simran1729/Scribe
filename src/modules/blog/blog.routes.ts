import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { blogController } from "./blog.controllers";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post(
  "/draft",
  authMiddleware,
  asyncHandler(blogController.createBlog)
);

router.get(
  "/draft/:id",
  authMiddleware,
  asyncHandler(blogController.getDraftById)
);

router.patch(
  "/draft/:id",
  authMiddleware,
  asyncHandler(blogController.autoSaveDraft)
);

router.delete(
  "/draft/:id",
  authMiddleware,
  asyncHandler(blogController.deleteDraft)
)

router.post(
  "/drafts/:id/publish",
  authMiddleware,
  asyncHandler(blogController.publishDraft)
);

// router.get(
//   "/",
//   authMiddleware,
//   asyncHandler(blogController.listBlogs)
// );


// router.post(
//   "/:id/unpublish",
//   authMiddleware,
//   asyncHandler(blogController.unpublish)
// );

// // Public
// router.get(
//   "/posts/:slug",
//   asyncHandler(blogController.getPublishedPost)
// );


export default router;
