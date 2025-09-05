import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createPost,
    getAllPosts,
    toggleLike,
    addComment,
    sharePost,
    deletePost,
    uploadImages,
    upload,
    testImages
} from "../controllers/explore.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Test route
router.get("/test-images", testImages);

// Image upload route
router.post("/upload-images", upload.array('images', 5), uploadImages);

// Post routes
router.post("/posts", createPost);
router.get("/posts", getAllPosts);
router.delete("/posts/:postId", deletePost);

// Interaction routes
router.post("/posts/:postId/like", toggleLike);
router.post("/posts/:postId/comment", addComment);
router.post("/posts/:postId/share", sharePost);

export default router;