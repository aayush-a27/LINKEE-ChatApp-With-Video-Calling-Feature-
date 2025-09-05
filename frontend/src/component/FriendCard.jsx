import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { acceptFriendRequest, sendFriendRequest } from "../lib/api";
import toast from "react-hot-toast";

const FriendCard = ({ 
  friend, 
  requestId, 
  onMessage, 
  type = "default",  
  isOutgoing = false  
}) => {
  const [expanded, setExpanded] = useState(false);
  const [accepted, setAccepted] = useState(false); // ✅ track acceptance

  // Mutation for sending a request
  const { mutate: sendRequest, isPending: sending } = useMutation({
    mutationFn: () => sendFriendRequest(friend._id),
    onSuccess: (data) => {
      toast.success(data.message || "Friend request sent!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to send request");
    },
  });

  // Mutation for accepting a request
  const { mutate: acceptReq, isPending: accepting } = useMutation({
    mutationFn: () => acceptFriendRequest(requestId),
    onSuccess: (data) => {
      toast.success(data.message || "Friend request accepted!");
      setAccepted(true); // ✅ mark as accepted
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to accept request");
    },
  });

  return (
    <div className="card w-full bg-base-100 shadow-xl hover:shadow-2xl transition rounded-xl">
      {/* Profile Pic + Basic Info */}
      <div className="flex items-center gap-4 p-4 border-b">
        <img
          src={friend.profilePic || "/default-avatar.png"}
          alt={friend.fullName}
          className="w-16 h-16 rounded-full object-cover border"
        />
        <div>
          <h3 className="font-semibold text-lg">{friend.fullName}</h3>
          <p className="text-sm opacity-70">
            {friend.nativeLanguage} • Learning {friend.learningLanguage}
          </p>
          <p className="text-sm opacity-70">{friend.location}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex justify-end gap-2 border-t">
        {type === "request" ? (
          <>
            {accepted ? (
              <button className="btn btn-success btn-sm" disabled>
                Accepted
              </button>
            ) : (
              <>
                <button
                  className="btn btn-success btn-sm"
                  disabled={accepting}
                  onClick={() => acceptReq()}
                >
                  {accepting ? "Accepting..." : "Accept"}
                </button>
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => toast("Reject functionality pending")}
                >
                  Reject
                </button>
              </>
            )}
          </>
        ) : isOutgoing ? ( // ✅ Outgoing requests
          <button className="btn btn-warning btn-sm" disabled>
            Pending
          </button>
        ) : type === "accepted" ? (
          <button className="btn btn-success btn-sm" disabled>
            Accepted
          </button>
        ) : type === "friend" ? (
          <button
            className="btn btn-success btn-sm"
            disabled
          >
            Friend
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            disabled={sending}
            onClick={() => sendRequest()}
          >
            {sending ? "Sending..." : "Send Request"}
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendCard;
