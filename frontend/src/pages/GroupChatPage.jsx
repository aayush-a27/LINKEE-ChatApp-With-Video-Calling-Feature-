import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
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
import Layout from "../component/Layout";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const GroupChatPage = () => {
  const [searchParams] = useSearchParams();
  const channelId = searchParams.get("channel");
  const { authUser } = useAuthUser();
  
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !channelId) return;
      
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

        const currentChannel = client.channel("messaging", channelId);
        await currentChannel.watch();

        setChatClient(client);
        setChannel(currentChannel);
      } catch (error) {
        console.error("Chat connection error:", error);
        toast.error("Could not connect to chat, please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    initChat();
  }, [tokenData, authUser, channelId]);

  if (loading || !chatClient || !channel) {
    return (
      <Layout showSidebar={true} showNavbar={true}>
        <ChatLoader />
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true} showNavbar={true}>
      <div className="w-full h-[calc(100vh-4rem)] flex flex-col">
        <Chat client={chatClient} theme="str-chat__theme-dark">
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </Layout>
  );
};

export default GroupChatPage;