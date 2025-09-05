import Group from "../models/Group.js";
import User from "../models/User.js";
import { StreamChat } from "stream-chat";
import multer from "multer";
import path from "path";
import fs from "fs";

// Group avatar multer configuration
const groupAvatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/groups';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const uploadGroupAvatarMulter = multer({ 
    storage: groupAvatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY);

// Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, description, isPrivate, members } = req.body;
        const adminId = req.user._id;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: "Group name is required" });
        }

        // Generate unique channel ID
        const channelId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create group in database
        const newGroup = new Group({
            name: name.trim(),
            description: description?.trim() || "",
            admin: adminId,
            isPrivate: isPrivate || false,
            streamChannelId: channelId,
            members: [{ user: adminId, role: "admin" }]
        });

        // Add other members if provided
        if (members && members.length > 0) {
            const memberObjects = members.map(memberId => ({
                user: memberId,
                role: "member"
            }));
            newGroup.members.push(...memberObjects);
        }

        await newGroup.save();
        await newGroup.populate("members.user", "fullName profilePic");
        await newGroup.populate("admin", "fullName profilePic");

        // Send notifications to added members (except admin)
        const membersToNotify = newGroup.members.filter(member => 
            member.user._id.toString() !== adminId.toString()
        );
        
        for (const member of membersToNotify) {
            if (global.notificationController) {
                global.notificationController.sendNotification(
                    adminId.toString(),
                    member.user._id.toString(),
                    {
                        type: 'group_joined',
                        title: 'Added to Group',
                        message: `You were added to group "${newGroup.name}" by ${newGroup.admin.fullName}`,
                        data: { groupId: newGroup._id, groupName: newGroup.name }
                    }
                );
            }
        }

        // Create Stream channel
        try {
            const memberIds = newGroup.members.map(member => member.user._id.toString());
            const channel = serverClient.channel("messaging", channelId, {
                name: newGroup.name,
                created_by_id: adminId.toString(),
                members: memberIds
            });
            await channel.create();
        } catch (streamError) {
            console.error("Error creating Stream channel:", streamError);
            // Delete the group if Stream channel creation fails
            await Group.findByIdAndDelete(newGroup._id);
            return res.status(500).json({ message: "Failed to create chat channel" });
        }

        res.status(201).json(newGroup);
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get user's groups
export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({
            "members.user": userId
        })
        .populate("admin", "fullName profilePic")
        .populate("members.user", "fullName profilePic")
        .sort({ updatedAt: -1 });

        res.json(groups);
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add member to group
export const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const requesterId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if requester is admin
        const requesterMember = group.members.find(m => m.user.toString() === requesterId.toString());
        if (!requesterMember || requesterMember.role !== "admin") {
            return res.status(403).json({ message: "Only admins can add members" });
        }

        // Check if user is already a member
        const existingMember = group.members.find(m => m.user.toString() === userId);
        if (existingMember) {
            return res.status(400).json({ message: "User is already a member" });
        }

        // Add member
        group.members.push({ user: userId, role: "member" });
        await group.save();

        // Add to Stream channel
        try {
            const channel = serverClient.channel("messaging", group.streamChannelId);
            await channel.addMembers([userId]);
        } catch (streamError) {
            console.error("Error adding member to Stream channel:", streamError);
            // Remove from database if Stream fails
            group.members = group.members.filter(m => m.user.toString() !== userId);
            await group.save();
            return res.status(500).json({ message: "Failed to add member to chat" });
        }

        await group.populate("members.user", "fullName profilePic");
        await group.populate("admin", "fullName profilePic");

        // Send notification to added member
        if (global.notificationController) {
            global.notificationController.sendNotification(
                requesterId.toString(),
                userId,
                {
                    type: 'group_joined',
                    title: 'Added to Group',
                    message: `You were added to group "${group.name}" by ${group.admin.fullName}`,
                    data: { groupId: group._id, groupName: group.name }
                }
            );
        }

        res.json(group);
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Remove member from group
export const removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        const requesterId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if requester is admin
        const requesterMember = group.members.find(m => m.user.toString() === requesterId.toString());
        if (!requesterMember || requesterMember.role !== "admin") {
            return res.status(403).json({ message: "Only admins can remove members" });
        }

        // Can't remove admin
        if (userId === group.admin.toString()) {
            return res.status(400).json({ message: "Cannot remove group admin" });
        }

        // Get user info before removal
        const removedUser = await User.findById(userId);
        
        // Remove member
        group.members = group.members.filter(m => m.user.toString() !== userId);
        await group.save();

        // Remove from Stream channel
        try {
            const channel = serverClient.channel("messaging", group.streamChannelId);
            await channel.removeMembers([userId]);
        } catch (streamError) {
            console.log("Error removing member from Stream channel:", streamError.message);
        }

        await group.populate("members.user", "fullName profilePic");
        await group.populate("admin", "fullName profilePic");

        // Send notification to removed member
        if (global.notificationController && removedUser) {
            global.notificationController.sendNotification(
                requesterId.toString(),
                userId,
                {
                    type: 'group_member_removed',
                    title: 'Removed from Group',
                    message: `You were removed from group "${group.name}" by ${group.admin.fullName}`,
                    data: { groupId: group._id, groupName: group.name }
                }
            );
        }

        res.json(group);
    } catch (error) {
        console.error("Error removing member:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Leave group
export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Admin cannot leave, must transfer ownership first
        if (group.admin.toString() === userId.toString()) {
            return res.status(400).json({ message: "Admin must transfer ownership before leaving" });
        }

        // Get user and group info before leaving
        const leavingUser = await User.findById(userId);
        await group.populate("admin", "fullName profilePic");
        
        // Remove member
        group.members = group.members.filter(m => m.user.toString() !== userId.toString());
        await group.save();

        // Remove from Stream channel
        try {
            const channel = serverClient.channel("messaging", group.streamChannelId);
            await channel.removeMembers([userId.toString()]);
        } catch (streamError) {
            console.log("Error removing user from Stream channel:", streamError.message);
        }

        // Send notification to admin about member leaving
        if (global.notificationController && leavingUser) {
            global.notificationController.sendNotification(
                userId.toString(),
                group.admin._id.toString(),
                {
                    type: 'group_member_left',
                    title: 'Member Left Group',
                    message: `${leavingUser.fullName} left the group "${group.name}"`,
                    data: { groupId: group._id, groupName: group.name }
                }
            );
        }

        // Send confirmation notification to the leaving member
        if (global.notificationController && leavingUser) {
            global.notificationController.sendNotification(
                userId.toString(),
                userId.toString(),
                {
                    type: 'group_member_left',
                    title: 'Left Group',
                    message: `You left the group "${group.name}"`,
                    data: { groupId: group._id, groupName: group.name }
                }
            );
        }

        res.json({ message: "Left group successfully" });
    } catch (error) {
        console.error("Error leaving group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Upload group avatar
export const uploadGroupAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No avatar uploaded" });
        }

        const avatarUrl = `/uploads/groups/${req.file.filename}`;
        
        res.json({ 
            message: "Avatar uploaded successfully",
            avatar: avatarUrl 
        });
    } catch (error) {
        console.error("Error uploading avatar:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update group avatar
export const updateGroupAvatar = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { avatar } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Only admin can update avatar
        if (group.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only admin can update group avatar" });
        }

        group.avatar = avatar;
        await group.save();
        await group.populate("admin", "fullName profilePic");
        await group.populate("members.user", "fullName profilePic");

        res.json(group);
    } catch (error) {
        console.error("Error leaving group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete group
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Only admin can delete
        if (group.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only admin can delete group" });
        }

        // Try to delete Stream channel (ignore if doesn't exist)
        try {
            const channel = serverClient.channel("messaging", group.streamChannelId);
            await channel.delete();
        } catch (streamError) {
            console.log("Stream channel already deleted or doesn't exist:", streamError.message);
        }

        // Delete group from database
        await Group.findByIdAndDelete(groupId);

        res.json({ message: "Group deleted successfully" });
    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};