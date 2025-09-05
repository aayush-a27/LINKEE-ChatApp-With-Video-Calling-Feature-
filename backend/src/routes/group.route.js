import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createGroup,
    getUserGroups,
    addMember,
    removeMember,
    leaveGroup,
    deleteGroup,
    uploadGroupAvatar,
    updateGroupAvatar,
    uploadGroupAvatarMulter
} from "../controllers/group.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Group CRUD operations
router.post("/", createGroup);
router.get("/", getUserGroups);
router.delete("/:groupId", deleteGroup);

// Avatar management
router.post("/upload-avatar", uploadGroupAvatarMulter.single('avatar'), uploadGroupAvatar);
router.put("/:groupId/avatar", updateGroupAvatar);

// Member management
router.post("/:groupId/members", addMember);
router.delete("/:groupId/members/:userId", removeMember);
router.post("/:groupId/leave", leaveGroup);

export default router;