import React, { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share, Trash2, Send, ChevronDown } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import html2canvas from "html2canvas";

const PostCard = ({ post, onLike, onComment, onShare, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { authUser } = useAuthUser();
  const dropdownRef = useRef(null);
  const postCardRef = useRef(null);

  // Function to capture post card as image
  const capturePostCard = async () => {
    if (!postCardRef.current) return null;
    
    try {
      const canvas = await html2canvas(postCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing post card:', error);
      return null;
    }
  };

  // Function to share with image
  const shareWithImage = async (platform) => {
    const imageDataUrl = await capturePostCard();
    const url = window.location.href;
    
    if (imageDataUrl && navigator.share) {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'post-image.png', { type: 'image/png' });
      
      try {
        await navigator.share({
          title: 'Check out this post!',
          text: `Check out this post from ${post.author?.fullName}`,
          url: url,
          files: [file]
        });
        return true;
      } catch (error) {
        console.log('Native sharing failed, falling back to platform sharing');
      }
    }
    
    // Fallback to platform-specific sharing
    return false;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isLiked = post.likes?.includes(authUser?._id);
  const isAuthor = post.author?._id === authUser?._id;

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    onComment(commentText.trim());
    setCommentText("");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div ref={postCardRef} className="card bg-base-100 shadow-lg">
      <div className="card-body">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <img
                  src={post.author?.profilePic || "/default-avatar.png"}
                  alt={post.author?.fullName}
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">{post.author?.fullName}</h3>
              <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>
          
          {isAuthor && (
            <button
              onClick={onDelete}
              className="btn btn-ghost btn-sm text-error"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Post Content */}
        <p className="text-base mb-4 whitespace-pre-wrap">{post.content}</p>

        {/* Post Images */}
        {post.images?.length > 0 && (
          <div className="grid grid-cols-1 gap-2 mb-4">
            {post.images.map((image, index) => {
              const localUrl = `http://localhost:5001${image}`;
              const tunnelUrl = `${import.meta.env.VITE_API_URL}${image}`;
              
              return (
                <img
                  key={index}
                  src={localUrl}
                  alt={`Post image ${index + 1}`}
                  className="w-full rounded-lg max-h-96 object-cover"
                  onError={(e) => {
                    // Fallback to tunnel URL if local fails
                    if (e.target.src === localUrl) {
                      e.target.src = tunnelUrl;
                    } else {
                      e.target.style.display = 'none';
                    }
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onLike}
              className={`flex items-center gap-2 btn btn-ghost btn-sm ${
                isLiked ? "text-red-500" : ""
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{post.likes?.length || 0}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 btn btn-ghost btn-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments?.length || 0}</span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 btn btn-ghost btn-sm"
              >
                <Share className="w-4 h-4" />
                <span>{post.shares?.length || 0}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showShareMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-base-100 shadow-lg rounded-lg border z-50 w-48">
                  <div className="py-2">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
                      onClick={async () => {
                        const shared = await shareWithImage('whatsapp');
                        if (!shared) {
                          const url = window.location.href;
                          const text = `Check out this post from ${post.author?.fullName}: ${url}`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }
                        setShowShareMenu(false);
                        onShare();
                      }}
                    >
                      📱 WhatsApp
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
                      onClick={async () => {
                        const shared = await shareWithImage('twitter');
                        if (!shared) {
                          const url = window.location.href;
                          const text = `Check out this post from ${post.author?.fullName}: ${url}`;
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                        }
                        setShowShareMenu(false);
                        onShare();
                      }}
                    >
                      🐦 Twitter
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
                      onClick={async () => {
                        const shared = await shareWithImage('facebook');
                        if (!shared) {
                          const url = window.location.href;
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                        }
                        setShowShareMenu(false);
                        onShare();
                      }}
                    >
                      📘 Facebook
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
                      onClick={async () => {
                        const shared = await shareWithImage('linkedin');
                        if (!shared) {
                          const url = window.location.href;
                          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                        }
                        setShowShareMenu(false);
                        onShare();
                      }}
                    >
                      💼 LinkedIn
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
                      onClick={async () => {
                        const imageDataUrl = await capturePostCard();
                        const url = window.location.href;
                        const subject = `Check out this post from ${post.author?.fullName}`;
                        const body = `I wanted to share this interesting post with you:\n\n${url}`;
                        
                        if (imageDataUrl) {
                          // For email, we'll include the image as a downloadable link
                          const link = document.createElement('a');
                          link.download = 'post-image.png';
                          link.href = imageDataUrl;
                          link.click();
                        }
                        
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                        setShowShareMenu(false);
                        onShare();
                      }}
                    >
                      📧 Email
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
                      onClick={async () => {
                        const imageDataUrl = await capturePostCard();
                        const url = window.location.href;
                        
                        try {
                          if (imageDataUrl && navigator.clipboard && navigator.clipboard.write) {
                            // Try to copy both image and URL to clipboard
                            const response = await fetch(imageDataUrl);
                            const blob = await response.blob();
                            await navigator.clipboard.write([
                              new ClipboardItem({
                                'image/png': blob,
                                'text/plain': new Blob([url], { type: 'text/plain' })
                              })
                            ]);
                            alert('Post image and link copied to clipboard!');
                          } else {
                            await navigator.clipboard.writeText(url);
                            alert('Link copied to clipboard!');
                          }
                        } catch (err) {
                          console.error('Failed to copy: ', err);
                          alert('Failed to copy to clipboard');
                        }
                        setShowShareMenu(false);
                        onShare();
                      }}
                    >
                      📋 Copy Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 border-t pt-4">
            {/* Add Comment */}
            <form onSubmit={handleComment} className="flex gap-2 mb-4">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full">
                  <img
                    src={authUser?.profilePic || "/default-avatar.png"}
                    alt={authUser?.fullName}
                  />
                </div>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="input input-bordered input-sm flex-1"
                  maxLength="500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="btn btn-primary btn-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {post.comments?.map((comment) => (
                <div key={comment._id} className="flex gap-2">
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      <img
                        src={comment.user?.profilePic || "/default-avatar.png"}
                        alt={comment.user?.fullName}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-base-200 rounded-lg px-3 py-2">
                      <h4 className="font-semibold text-sm">{comment.user?.fullName}</h4>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;