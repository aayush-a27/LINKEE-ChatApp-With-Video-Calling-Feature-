import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { getAllPosts, createPost, toggleLike, addComment, sharePost, deletePost } from "../lib/api";
import Layout from "../component/Layout";
import PostCard from "../component/PostCard";
import CreatePost from "../component/CreatePost";
import { Compass } from "lucide-react";
import toast from "react-hot-toast";
import { useSocket } from "../socket.jsx";

const ExplorePage = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Get posts
  const { data: postsData, isLoading, fetchNextPage, hasNextPage } = useQuery({
    queryKey: ["explorePosts", page],
    queryFn: () => getAllPosts(page, 10),
    keepPreviousData: true,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(["explorePosts"]);
      toast.success("Post created successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create post");
    },
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update like");
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: ({ postId, content }) => addComment(postId, content),
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add comment");
    },
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: sharePost,
    onSuccess: () => {
      toast.success("Post shared successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to share post");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries(["explorePosts"]);
      toast.success("Post deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete post");
    },
  });

  // Socket events
  useEffect(() => {
    if (socket) {
      socket.emit('joinExplore');

      const handleNewPost = () => {
        queryClient.invalidateQueries(["explorePosts"]);
      };

      const handlePostUpdate = () => {
        queryClient.invalidateQueries(["explorePosts"]);
      };

      socket.on('newPost', handleNewPost);
      socket.on('postLikeUpdate', handlePostUpdate);
      socket.on('newComment', handlePostUpdate);
      socket.on('postShareUpdate', handlePostUpdate);
      socket.on('postDeleted', handlePostUpdate);

      return () => {
        socket.emit('leaveExplore');
        socket.off('newPost', handleNewPost);
        socket.off('postLikeUpdate', handlePostUpdate);
        socket.off('newComment', handlePostUpdate);
        socket.off('postShareUpdate', handlePostUpdate);
        socket.off('postDeleted', handlePostUpdate);
      };
    }
  }, [socket]);

  const posts = postsData?.posts || [];

  return (
    <Layout showSidebar={true} showNavbar={true}>
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Compass className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Explore</h1>
        </div>

        {/* Create Post */}
        <CreatePost onSubmit={(data) => createPostMutation.mutate(data)} />

        {/* Posts Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <Compass className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts yet</h3>
              <p className="text-gray-500">Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={() => likeMutation.mutate(post._id)}
                onComment={(content) => commentMutation.mutate({ postId: post._id, content })}
                onShare={() => shareMutation.mutate(post._id)}
                onDelete={() => deleteMutation.mutate(post._id)}
              />
            ))
          )}
        </div>

        {/* Load More */}
        {postsData?.hasMore && (
          <div className="text-center mt-6">
            <button
              onClick={() => setPage(prev => prev + 1)}
              className="btn btn-outline"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExplorePage;