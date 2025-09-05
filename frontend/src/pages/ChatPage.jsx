import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, sendCall } from "../lib/api";

import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
  Thread,
  ChannelHeader,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

import toast from "react-hot-toast";
import ChatLoader from "../component/ChatLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = ({ friendData, className }) => {
  const friendId = friendData._id;
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  
  const [chatClient, setChatClient] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !friendId) return;
      try {

        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );
        const channelId = [authUser._id, friendId].sort().join("-");
        const currentChannel = client.channel("messaging", channelId, {
          members: [authUser._id, friendId],
        });
        await currentChannel.watch();

        setChatClient(client);
        setChannel(currentChannel);
      } catch (error) {

        toast.error("Could not connect to chat, please try again.");
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, [tokenData, authUser, friendId]);

  // Start call function - this will trigger the call through the backend
  const startCall = async (callType = 'video') => {
    if (!friendData || !authUser) return;
    
    try {
      const response = await sendCall({
        friendId: friendData._id,
        callType: callType
      });
      
      if (response.success) {
        toast.success(`Calling ${friendData.fullName}...`);
        navigate('/call', { 
          state: { 
            friendData: friendData,
            callData: { ...response.data, callType } 
          } 
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {

      toast.error(error.response?.data?.message || 'Failed to start call');
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  const handleClick = () => {
    setProfileOpen(true);
  };

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 flex justify-end bg-black/40 z-50">
          {/* Sidebar drawer */}
          <div className="w-80 h-full bg-base-100 shadow-xl border-l animate-slide-in p-5 overflow-y-auto">
            {/* Close button */}
            <div className="flex justify-end">
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setProfileOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Profile image */}
            <div className="flex flex-col items-center mt-4">
              <img
                src={friendData.profilePic}
                alt="Profile"
                className="rounded-full w-28 h-28 object-cover shadow-md bg-blue-500"
              />
              <h2 className="text-xl font-bold mt-3">{friendData.fullName}</h2>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-around mt-6">
              <button
                className="btn btn-outline btn-info"
                onClick={() => {
                  setProfileOpen(false);
                  startCall('video');
                }}
              >
                📹 Video
              </button>
              <button 
                className="btn btn-outline btn-success"
                onClick={() => {
                  setProfileOpen(false);
                  startCall('audio');
                }}
              >
                📞 Voice
              </button>
            </div>

            {/* Info Section */}
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-400">About</h3>
                <p className="text-sm">
                  {friendData.bio || "Hey there! I am using this app."}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-400">Country</h3>
                <p className="text-sm">{friendData.location || "Unknown"}</p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-400">
                  Native Language
                </h3>
                <p className="text-sm">{friendData.nativeLanguage}</p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-400">
                  Learning Language
                </h3>
                <p className="text-sm">{friendData.learningLanguage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Chat client={chatClient} theme="str-chat__theme-dark">
        <Channel channel={channel}>
          <Window>
            <div onClick={handleClick}>
              <ChannelHeader />
            </div>
            <MessageList />
            <MessageInput focus />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;