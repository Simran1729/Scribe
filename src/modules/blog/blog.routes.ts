import { Router } from "express";

const router = Router();

// ✅ CREATE blog (draft)
// router.post("/", createBlog);

// // ✅ GET all blogs (list / feed / filters)
// router.get("/", getBlogs);

// // ✅ STATIC / ACTION routes (put BEFORE :id)

// // publish
// router.post("/:id/publish", publishBlog);

// // report
// router.patch("/:id/block", blockBlog); -- add report or block blog schema

// // slug (VERY IMPORTANT before :id)
// router.get("/slug/:slug", getBlogBySlug);

// // ✅ DYNAMIC routes (generic ones LAST)

// // update blog
// router.patch("/:id", updateBlog);

// // delete blog
// router.delete("/:id", deleteBlog);

// // get blog by id (editor)
// router.get("/:id", getBlogById);

export default router;