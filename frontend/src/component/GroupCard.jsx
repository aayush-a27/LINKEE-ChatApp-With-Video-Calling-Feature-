import React, { useState } from "react";
import { Users, Settings, MessageCircle, Trash2, LogOut } from "lucide-react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadGroupAvatar, updateGroupAvatar } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import GroupMembersModal from "./GroupMembersModal";
import toast from "react-hot-toast";

const GroupCard = ({ group, onDelete, onLeave }) => {
  const [showMembers, setShowMembers] = useState(false);
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  
  const isAdmin = group.admin._id === authUser?._id;
  const memberCount = group.members?.length || 0;

  // Avatar upload mutation
  const avatarMutation = useMutation({
    mutationFn: async (file) => {
      const uploadResult = await uploadGroupAvatar(file);
      return updateGroupAvatar(group._id, uploadResult.avatar);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userGroups"]);
      toast.success("Group avatar updated!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update avatar");
    },
  });

  const handleAvatarChange = (file) => {
    if (file && isAdmin) {
      avatarMutation.mutate(file);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
        <div className="card-body">
          {/* Group Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="avatar relative">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                {group.avatar ? (
                  <img 
                    src={group.avatar.startsWith('http') ? group.avatar : `http://localhost:5001${group.avatar}`} 
                    alt={group.name} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Users className="w-6 h-6" />
                )}
              </div>
              {isAdmin && (
                <label className="absolute -bottom-1 -right-1 btn btn-xs btn-circle btn-primary cursor-pointer">
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAvatarChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{group.name}</h3>
              {isAdmin && (
                <span className="badge badge-primary badge-sm">Admin</span>
              )}
            </div>
          </div>

          {/* Description */}
          {group.description && (
            <p className="text-sm text-gray-600 mb-3">{group.description}</p>
          )}

          {/* Members Count */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Users className="w-4 h-4" />
            <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              to={`/chat?channel=${group.streamChannelId}`}
              className="btn btn-primary btn-sm flex-1"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Link>
            
            <button
              onClick={() => setShowMembers(true)}
              className="btn btn-ghost btn-sm"
            >
              <Settings className="w-4 h-4" />
            </button>

            {isAdmin ? (
              <button
                onClick={onDelete}
                className="btn btn-error btn-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onLeave}
                className="btn btn-warning btn-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Members Modal */}
      <GroupMembersModal
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        group={group}
        isAdmin={isAdmin}
      />
    </>
  );
};

export default GroupCard;