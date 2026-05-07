import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { blogController } from "./blog.controllers";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post(
  "/drafts",
  authMiddleware,
  asyncHandler(blogController.createDraft)
);

router.get(
  "/",
  authMiddleware,
  asyncHandler(blogController.listBlogs)
);

router.get(
  "/drafts/:id",
  authMiddleware,
  asyncHandler(blogController.getDraftById)
);

router.patch(
  "/drafts/:id",
  authMiddleware,
  asyncHandler(blogController.autosaveDraft)
);

router.post(
  "/drafts/:id/publish",
  authMiddleware,
  asyncHandler(blogController.publishDraft)
);

router.post(
  "/:id/unpublish",
  authMiddleware,
  asyncHandler(blogController.unpublish)
);

// Public
router.get(
  "/posts/:slug",
  asyncHandler(blogController.getPublishedPost)
);


export default router;
