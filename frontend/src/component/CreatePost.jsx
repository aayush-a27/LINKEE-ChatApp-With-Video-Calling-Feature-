import React, { useState } from "react";
import { Image, Send, X } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { uploadImages } from "../lib/api";
import toast from "react-hot-toast";

const CreatePost = ({ onSubmit }) => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { authUser } = useAuthUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setUploading(true);
    let uploadedImages = [];

    try {
      if (selectedFiles.length > 0) {
        const uploadResult = await uploadImages(selectedFiles);
        uploadedImages = uploadResult.images;
      }
      onSubmit({
        content: content.trim(),
        images: uploadedImages
      });

      setContent("");
      setImages([]);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...imageUrls]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="card bg-base-100 shadow-lg mb-6">
      <div className="card-body">
        <div className="flex gap-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full">
              <img
                src={authUser?.profilePic || "/default-avatar.png"}
                alt={authUser?.fullName}
              />
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="textarea textarea-ghost w-full resize-none text-lg"
              rows="3"
              maxLength="1000"
            />
            
            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 btn btn-circle btn-xs btn-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <label className="btn btn-ghost btn-sm">
                  <Image className="w-4 h-4" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {content.length}/1000
                </span>
                <button
                  type="submit"
                  disabled={!content.trim() || uploading}
                  className="btn btn-primary btn-sm"
                >
                  {uploading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {uploading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;