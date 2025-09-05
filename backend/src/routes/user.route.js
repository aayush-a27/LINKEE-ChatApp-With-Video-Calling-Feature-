import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequestsAndAccepted,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  updateProfile,
} from "../controllers/user.controller.js";

const router = express.Router();
router.use(protectRoute); // Apply auth middleware to every route

// Existing user routes
router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.get("/friend-requests", getFriendRequestsAndAccepted);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);
router.put("/profile", updateProfile);



export default router;