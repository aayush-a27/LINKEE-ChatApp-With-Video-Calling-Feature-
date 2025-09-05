import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  getUserFriends,
  getFriendRequest,
  getRecommendedUsers,
  sendFriendRequest,
  acceptFriendRequest,
} from "../lib/api";
import Layout from "../component/Layout";
import FriendCard from "../component/FriendCard";
import { Search, Users, UserPlus, Heart } from "lucide-react";
import toast from "react-hot-toast";

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Get user's friends
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["userFriends"],
    queryFn: getUserFriends,
  });

  // Get friend requests (incoming)
  const { data: friendRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequest,
  });

  // Get recommended users for search
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: getRecommendedUsers,
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(["friendRequests"]);
      queryClient.invalidateQueries(["recommendedUsers"]);
      toast.success("Friend request sent!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send request");
    },
  });

  // Accept friend request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(["friendRequests"]);
      queryClient.invalidateQueries(["userFriends"]);
      toast.success("Friend request accepted!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to accept request");
    },
  });

  // Filter users based on search query and exclude existing friends
  const friendIds = friends.map(friend => friend._id);
  const filteredUsers = recommendedUsers.filter((user) =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !friendIds.includes(user._id)
  );

  const incomingRequests = friendRequests?.incomingReqs || [];

  return (
    <Layout showSidebar={true} showNavbar={true}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Friends</h1>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-4 sm:mb-6 overflow-x-auto">
          <button
            className={`tab tab-sm sm:tab-md ${activeTab === "friends" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">My Friends</span>
            <span className="sm:hidden">Friends</span>
            <span className="ml-1">({friends.length})</span>
          </button>
          <button
            className={`tab tab-sm sm:tab-md ${activeTab === "requests" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span>Requests</span>
            <span className="ml-1">({incomingRequests.length})</span>
          </button>
          <button
            className={`tab tab-sm sm:tab-md ${activeTab === "search" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Find Friends</span>
            <span className="sm:hidden">Find</span>
          </button>
        </div>

        {/* My Friends Tab */}
        {activeTab === "friends" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Friends</h2>
              <div className="text-sm text-gray-500">{friends.length} friends</div>
            </div>

            {loadingFriends ? (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No friends yet</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 px-4">Start connecting with people!</p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="btn btn-primary btn-sm sm:btn-md"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {friends.map((friend) => (
                  <FriendCard
                    key={friend._id}
                    friend={friend}
                    type="friend"
                    onMessage={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friend Requests Tab */}
        {activeTab === "requests" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Friend Requests</h2>
              <div className="text-xs sm:text-sm text-gray-500">{incomingRequests.length} pending</div>
            </div>

            {loadingRequests ? (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : incomingRequests.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No pending requests</h3>
                <p className="text-sm sm:text-base text-gray-500 px-4">When someone sends you a friend request, it will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {incomingRequests.map((request) => (
                  <FriendCard
                    key={request._id}
                    friend={request.sender}
                    requestId={request._id}
                    type="request"
                    onAccept={(requestId) => acceptRequestMutation.mutate(requestId)}
                    onMessage={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Friends Tab */}
        {activeTab === "search" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Find New Friends</h2>
            </div>

            {/* Search Input */}
            <div className="relative mb-4 sm:mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search users by name..."
                className="input input-bordered input-sm sm:input-md w-full pl-9 sm:pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <UserPlus className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                  {searchQuery ? "No users found" : "No users available"}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 px-4">
                  {searchQuery 
                    ? "Try searching with a different name" 
                    : "Check back later for new users to connect with"
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredUsers.map((user) => (
                  <FriendCard
                    key={user._id}
                    friend={user}
                    type="search"
                    onSendRequest={(userId) => sendRequestMutation.mutate(userId)}
                    onMessage={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FriendsPage;