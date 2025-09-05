import React, { useState } from "react";
import { Users, UserCheck } from "lucide-react";

const FriendsList = ({ friends, groups = [], loading, onSelectFriend }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("friends");

  if (loading) return <p className="p-4">Loading...</p>;

  // Filter friends by search term
  const filteredFriends = friends.filter((friend) =>
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter groups by search term
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGroupSelect = (group) => {
    // Navigate to group chat
    window.location.href = `/chat?channel=${group.streamChannelId}`;
  };

  return (
    <div className="w-full sm:w-1/3 sm:border-r border-base-300 overflow-y-auto h-full flex flex-col">
      {/* Tabs */}
      <div className="tabs tabs-boxed mb-4">
        <button
          className={`tab tab-sm ${activeTab === "friends" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("friends")}
        >
          <Users className="w-4 h-4 mr-1" />
          Friends
        </button>
        <button
          className={`tab tab-sm ${activeTab === "groups" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("groups")}
        >
          <UserCheck className="w-4 h-4 mr-1" />
          Groups
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full input-sm"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        {activeTab === "friends" ? (
          filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <div
                key={friend._id}
                onClick={() => onSelectFriend(friend)}
                className="card card-compact hover:bg-zinc-800 shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <div className="card-body flex flex-row items-center gap-4">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img
                        className="scale-125 mt-1 bg-blue-500"
                        src={friend.profilePic || "/default-avatar.png"}
                        alt={friend.fullName}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base-content text-lg">
                      {friend.fullName}
                    </h3>
                    <p className="text-sm opacity-80">
                      learning: {friend.learningLanguage || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No friends found.</p>
          )
        ) : (
          filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div
                key={group._id}
                onClick={() => handleGroupSelect(group)}
                className="card card-compact hover:bg-zinc-800 shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <div className="card-body flex flex-row items-center gap-4">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base-content text-lg">
                      {group.name}
                    </h3>
                    <p className="text-sm opacity-80">
                      {group.members?.length || 0} members
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No groups found.</p>
          )
        )}
      </div>
    </div>
  );
};

export default FriendsList;
