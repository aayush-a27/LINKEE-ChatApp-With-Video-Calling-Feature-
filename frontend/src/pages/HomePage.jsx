import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import { useMutation } from "@tanstack/react-query";
import { getUserFriends, getUserGroups } from "../lib/api";
import toast from "react-hot-toast";
import FriendsList from "../component/FriendsList";
import ChatPage from "./ChatPage";

const Home = () => {
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedFriendDetails, setSelectedFriendDetails] = useState(null);

  const { mutate: getFriends } = useMutation({
    mutationFn: getUserFriends,
    onSuccess: (data) => {
      setFriends(data);
      setLoadingFriends(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to load friends");
      setLoadingFriends(false);
    },
  });

  const { mutate: getGroups } = useMutation({
    mutationFn: getUserGroups,
    onSuccess: (data) => {
      setGroups(data);
      setLoadingGroups(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to load groups");
      setLoadingGroups(false);
    },
  });

  useEffect(() => {
    setLoadingFriends(true);
    setLoadingGroups(true);
    getFriends();
    getGroups();
  }, [getFriends, getGroups]);

  return (
    <Layout showSidebar={true} showNavbar={true}>
      {/* Mobile: Show either friends list OR chat */}
      <div className="sm:hidden w-full h-full">
        {selectedFriendDetails ? (
          <div className="w-full h-full relative">
            <ChatPage friendData={selectedFriendDetails} className="w-full h-full" />
          </div>
        ) : (
          <FriendsList
            friends={friends}
            groups={groups}
            loading={loadingFriends || loadingGroups}
            className="w-full h-full"
            onSelectFriend={(friend) => setSelectedFriendDetails(friend)}
          />
        )}
      </div>

      {/* Desktop: Show both side by side */}
      <div className="hidden sm:flex w-full h-full gap-10">
        <FriendsList
          friends={friends}
          groups={groups}
          loading={loadingFriends || loadingGroups}
          className="w-1/3"
          onSelectFriend={(friend) => setSelectedFriendDetails(friend)}
        />
        
        <div className="flex w-2/3 items-center justify-center text-white">
          {selectedFriendDetails ? (
            <ChatPage friendData={selectedFriendDetails} className="w-full" />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-center">
              <h2 className="text-2xl font-semibold">Let's Connect 👋</h2>
              <p className="text-gray-400 mt-2">
                Select a friend from the list to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;