import React, { useState } from "react";
import { X, UserPlus, UserMinus, Crown } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addGroupMember, removeGroupMember, getUserFriends } from "../lib/api";
import toast from "react-hot-toast";

const GroupMembersModal = ({ isOpen, onClose, group, isAdmin }) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const queryClient = useQueryClient();

  // Get friends for adding members
  const { data: friends = [] } = useQuery({
    queryKey: ["userFriends"],
    queryFn: getUserFriends,
    enabled: isOpen && showAddMember
  });

  const users = friends; // Use friends as users

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: ({ groupId, userId }) => addGroupMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["userGroups"]);
      setShowAddMember(false);
      toast.success("Member added successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add member");
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: ({ groupId, userId }) => removeGroupMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["userGroups"]);
      toast.success("Member removed successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove member");
    },
  });

  // Filter users not in group
  const availableUsers = users.filter(user => 
    !group.members.some(member => member.user._id === user._id)
  );

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Group Members</h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Member Section */}
        {isAdmin && (
          <div className="mb-6">
            {!showAddMember ? (
              <button
                onClick={() => setShowAddMember(true)}
                className="btn btn-primary btn-sm"
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </button>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Add New Member</h4>
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="btn btn-ghost btn-xs"
                  >
                    Cancel
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {availableUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-2">No users available to add</p>
                  ) : (
                    availableUsers.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-2 hover:bg-base-200 rounded">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-8 h-8 rounded-full">
                              <img
                                src={user.profilePic || "/default-avatar.png"}
                                alt={user.fullName}
                              />
                            </div>
                          </div>
                          <span>{user.fullName}</span>
                        </div>
                        <button
                          onClick={() => addMemberMutation.mutate({ groupId: group._id, userId: user._id })}
                          disabled={addMemberMutation.isLoading}
                          className="btn btn-primary btn-xs"
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Members */}
        <div>
          <h4 className="font-semibold mb-3">Current Members ({group.members?.length || 0})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {group.members?.map((member) => (
              <div key={member.user._id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img
                        src={member.user.profilePic || "/default-avatar.png"}
                        alt={member.user.fullName}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{member.user.fullName}</p>
                    <div className="flex items-center gap-2">
                      {member.role === "admin" && (
                        <span className="badge badge-primary badge-sm">
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remove Member Button (only for admin, can't remove admin) */}
                {isAdmin && member.role !== "admin" && (
                  <button
                    onClick={() => removeMemberMutation.mutate({ groupId: group._id, userId: member.user._id })}
                    disabled={removeMemberMutation.isLoading}
                    className="btn btn-error btn-sm"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;