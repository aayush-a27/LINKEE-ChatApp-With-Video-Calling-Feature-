import { axiosInstance } from "./axios";

// Existing API functions
export const signup = async (signupData) => {
  const res = await axiosInstance.post("/auth/signup", signupData);
  return res.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("error in getAuthUser : ", error);
    return null;
  }
};

export const onboard = async (onboardData) => {
  const res = await axiosInstance.post("/auth/onboard", onboardData);
  return res.data;
};

export const login = async (formData) => {
  const res = await axiosInstance.post("/auth/login", formData);
  return res.data;
};

export const logout = async () => {
  const res = await axiosInstance.post("/auth/logout");
  return res.data;
};

export const getUserFriends = async () => {
  const res = await axiosInstance.get("/users/friends");
  return res.data;
};

export const getRecommendedUsers = async () => {
  const res = await axiosInstance.get("/users");
  return res.data;
};

export const getOutgoingFriendReqs = async () => {
  const res = await axiosInstance.get("/users/outgoing-friend-requests");
  return res.data;
};

export const sendFriendRequest = async (userId) => {
  const res = await axiosInstance.post(`/users/friend-request/${userId}`);
  return res.data;
};

export const getFriendRequest = async () => {
  const res = await axiosInstance.get("/users/friend-requests");
  return res.data;
};

export const acceptFriendRequest = async (userId) => {
  const res = await axiosInstance.put(`/users/friend-request/${userId}/accept`);
  return res.data;
};

export const getStreamToken = async () => {
  const res = await axiosInstance.get(`/chat/token`);
  return res.data;
};

// Call API functions
export const sendCall = async ({ friendId, callType = 'video' }) => {
  const res = await axiosInstance.post("/calls/send", {
    friendId,
    callType,
  });
  return res.data;
};

export const receiveCall = async (callId) => {
  const res = await axiosInstance.post("/calls/receive", {
    callId,
  });
  return res.data;
};

export const rejectCall = async (callId) => {
  const res = await axiosInstance.post("/calls/reject", {
    callId,
  });
  return res.data;
};

export const endCall = async (callId) => {
  const res = await axiosInstance.post("/calls/end", {
    callId,
  });
  return res.data;
};

export const getCallStatus = async (callId) => {
  const res = await axiosInstance.get(`/calls/${callId}/status`);
  return res.data;
};

export const getActiveCalls = async () => {
  const res = await axiosInstance.get("/calls/active");
  return res.data;
};

export const getOnlineUsers = async () => {
  const res = await axiosInstance.get("/calls/users/online");
  return res.data;
};

// Notification API functions
export const getNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  const res = await axiosInstance.get(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
  return res.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const res = await axiosInstance.patch(`/notifications/${notificationId}/read`);
  return res.data;
};

export const markAllNotificationsAsRead = async () => {
  const res = await axiosInstance.patch('/notifications/read-all');
  return res.data;
};

export const deleteNotification = async (notificationId) => {
  const res = await axiosInstance.delete(`/notifications/${notificationId}`);
  return res.data;
};

// Profile API functions
export const updateProfile = async (profileData) => {
  const res = await axiosInstance.put('/users/profile', profileData);
  return res.data;
};

// Explore API functions
export const createPost = async (postData) => {
  const res = await axiosInstance.post("/explore/posts", postData);
  return res.data;
};

export const getAllPosts = async (page = 1, limit = 10) => {
  const res = await axiosInstance.get(`/explore/posts?page=${page}&limit=${limit}`);
  return res.data;
};

export const toggleLike = async (postId) => {
  const res = await axiosInstance.post(`/explore/posts/${postId}/like`);
  return res.data;
};

export const addComment = async (postId, content) => {
  const res = await axiosInstance.post(`/explore/posts/${postId}/comment`, { content });
  return res.data;
};

export const sharePost = async (postId) => {
  const res = await axiosInstance.post(`/explore/posts/${postId}/share`);
  return res.data;
};

export const deletePost = async (postId) => {
  const res = await axiosInstance.delete(`/explore/posts/${postId}`);
  return res.data;
};

export const uploadImages = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  
  const res = await axiosInstance.post('/explore/upload-images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

// Group API functions
export const createGroup = async (groupData) => {
  const res = await axiosInstance.post('/groups', groupData);
  return res.data;
};

export const getUserGroups = async () => {
  const res = await axiosInstance.get('/groups');
  return res.data;
};

export const addGroupMember = async (groupId, userId) => {
  const res = await axiosInstance.post(`/groups/${groupId}/members`, { userId });
  return res.data;
};

export const removeGroupMember = async (groupId, userId) => {
  const res = await axiosInstance.delete(`/groups/${groupId}/members/${userId}`);
  return res.data;
};

export const leaveGroup = async (groupId) => {
  const res = await axiosInstance.post(`/groups/${groupId}/leave`);
  return res.data;
};

export const deleteGroup = async (groupId) => {
  const res = await axiosInstance.delete(`/groups/${groupId}`);
  return res.data;
};

export const uploadGroupAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const res = await axiosInstance.post('/groups/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const updateGroupAvatar = async (groupId, avatar) => {
  const res = await axiosInstance.put(`/groups/${groupId}/avatar`, { avatar });
  return res.data;
};

