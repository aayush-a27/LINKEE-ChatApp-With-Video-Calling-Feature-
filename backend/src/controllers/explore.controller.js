import Post from "../models/Post.js";
import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Utility function to validate and sanitize file paths
const validateFilePath = (filePath, allowedDir) => {
    const normalizedPath = path.normalize(filePath);
    const resolvedPath = path.resolve(allowedDir, normalizedPath);
    const allowedDirResolved = path.resolve(allowedDir);
    
    if (!resolvedPath.startsWith(allowedDirResolved)) {
        throw new Error('Invalid file path');
    }
    return resolvedPath;
};

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/posts';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { content, images } = req.body;
        const userId = req.user._id;

        console.log('Creating post with data:', { content, images, userId });

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Content is required" });
        }

        const newPost = new Post({
            author: userId,
            content: content.trim(),
            images: images || []
        });

        await newPost.save();
        await newPost.populate("author", "fullName profilePic");

        console.log('Post saved:', newPost);

        // Emit to explore room
        if (global.io) {
            global.io.to('explore').emit("newPost", newPost);
        }

        res.status(201).json(newPost);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all posts for explore page
export const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate("author", "fullName profilePic")
            .populate("comments.user", "fullName profilePic")
            .populate("likes", "fullName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments();
        const hasMore = skip + posts.length < totalPosts;

        res.json({
            posts,
            hasMore,
            totalPosts
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Like/Unlike a post
export const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const isLiked = post.likes.includes(userId);
        
        if (isLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        await post.populate("author", "fullName profilePic");

        // Emit like update
        if (global.io) {
            global.io.to('explore').emit("postLikeUpdate", {
                postId,
                likesCount: post.likes.length,
                isLiked: !isLiked
            });
        }

        res.json({
            message: isLiked ? "Post unliked" : "Post liked",
            likesCount: post.likes.length,
            isLiked: !isLiked
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add comment to post
export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const newComment = {
            user: userId,
            content: content.trim()
        };

        post.comments.push(newComment);
        await post.save();
        
        await post.populate("comments.user", "fullName profilePic");
        const addedComment = post.comments[post.comments.length - 1];

        // Emit new comment
        if (global.io) {
            global.io.to('explore').emit("newComment", {
                postId,
                comment: addedComment
            });
        }

        res.status(201).json(addedComment);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Share a post
export const sharePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const alreadyShared = post.shares.some(share => share.user.toString() === userId.toString());
        if (alreadyShared) {
            return res.status(400).json({ message: "Post already shared" });
        }

        post.shares.push({ user: userId });
        await post.save();

        // Emit share update
        if (global.io) {
            global.io.to('explore').emit("postShareUpdate", {
                postId,
                sharesCount: post.shares.length
            });
        }

        res.json({
            message: "Post shared successfully",
            sharesCount: post.shares.length
        });
    } catch (error) {
        console.error("Error sharing post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Upload images for posts
export const uploadImages = async (req, res) => {
    try {
        console.log('Upload request received:', req.files);
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No images uploaded" });
        }

        const imageUrls = req.files.map(file => {
            // Validate filename to prevent path traversal
            const sanitizedFilename = path.basename(file.filename);
            return `/uploads/posts/${sanitizedFilename}`;
        });
        
        console.log('Generated image URLs:', imageUrls);
        
        res.json({ 
            message: "Images uploaded successfully",
            images: imageUrls 
        });
    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Test endpoint to check uploaded files
export const testImages = async (req, res) => {
    try {
        const fs = await import('fs');
        const path = await import('path');
        
        const uploadsDir = 'uploads/posts';
        const validatedDir = validateFilePath('.', uploadsDir);
        const files = fs.default.existsSync(validatedDir) ? fs.default.readdirSync(validatedDir) : [];
        
        res.json({
            message: "Files in uploads directory",
            files: files,
            uploadsPath: uploadsDir
        });
    } catch (error) {
        console.error("Error checking files:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a post (only by author)
export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this post" });
        }

        await Post.findByIdAndDelete(postId);

        // Emit post deletion
        if (global.io) {
            global.io.to('explore').emit("postDeleted", { postId });
        }

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};