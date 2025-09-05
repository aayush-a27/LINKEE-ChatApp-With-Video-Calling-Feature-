import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { getUserGroups, createGroup, deleteGroup, leaveGroup } from "../lib/api";
import Layout from "../component/Layout";
import GroupCard from "../component/GroupCard";
import CreateGroupModal from "../component/CreateGroupModal";
import { Users, Plus } from "lucide-react";
import toast from "react-hot-toast";

const GroupsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  // Get user's groups
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["userGroups"],
    queryFn: getUserGroups,
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries(["userGroups"]);
      setShowCreateModal(false);
      toast.success("Group created successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create group");
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries(["userGroups"]);
      toast.success("Group deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete group");
    },
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: leaveGroup,
    onSuccess: () => {
      queryClient.invalidateQueries(["userGroups"]);
      toast.success("Left group successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to leave group");
    },
  });

  return (
    <Layout showSidebar={true} showNavbar={true}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Groups</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Create Group</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No groups yet</h3>
            <p className="text-gray-500 mb-4">Create or join a group to start chatting!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm sm:btn-md"
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard
                key={group._id}
                group={group}
                onDelete={() => deleteGroupMutation.mutate(group._id)}
                onLeave={() => leaveGroupMutation.mutate(group._id)}
              />
            ))}
          </div>
        )}

        {/* Create Group Modal */}
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createGroupMutation.mutate(data)}
          isLoading={createGroupMutation.isLoading}
        />
      </div>
    </Layout>
  );
};

export default GroupsPage;