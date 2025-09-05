import React, { useState } from "react";
import { X, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";

const CreateGroupModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
    members: []
  });

  // Get friends for member selection
  const { data: friends = [] } = useQuery({
    queryKey: ["userFriends"],
    queryFn: getUserFriends,
    enabled: isOpen
  });

  const users = friends; // Use friends as users

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSubmit(formData);
  };

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      isPrivate: false,
      members: []
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Create New Group</h3>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Group Name */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Group Name *</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name"
              className="input input-bordered"
              maxLength="50"
              required
            />
          </div>

          {/* Description */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter group description (optional)"
              className="textarea textarea-bordered"
              maxLength="200"
              rows="3"
            />
          </div>

          {/* Privacy */}
          <div className="form-control mb-4">
            <label className="label cursor-pointer">
              <span className="label-text">Private Group</span>
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                className="checkbox"
              />
            </label>
          </div>

          {/* Add Members */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Add Members</span>
            </label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users available</p>
              ) : (
                users.map((user) => (
                  <label key={user._id} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.members.includes(user._id)}
                      onChange={() => toggleMember(user._id)}
                      className="checkbox checkbox-sm"
                    />
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full">
                        <img
                          src={user.profilePic || "/default-avatar.png"}
                          alt={user.fullName}
                        />
                      </div>
                    </div>
                    <span className="flex-1">{user.fullName}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Create Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;