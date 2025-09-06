import { Navigate, Route, Routes, useNavigate } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnBoardingPage from "./pages/OnBoardingPage";
import NotificationPage from "./pages/NotificationPage";
import ChatPage from "./pages/ChatPage";
import FriendsPage from "./pages/FriendsPage";
import ExplorePage from "./pages/ExplorePage";
import GroupsPage from "./pages/GroupsPage";
import GroupChatPage from "./pages/GroupChatPage";
import SettingsPage from "./pages/SettingsPage";
import ContactPage from "./pages/ContactPage";

import { Toaster } from "react-hot-toast";
import PageLoader from "./component/PageLoader";
import useAuthUser from "./hooks/useAuthUser";
import CallPage from "./pages/CallPage";
import { SocketProvider, useSocket } from "./socket.jsx";
import CallModal from "./component/CallModal";
import { receiveCall, rejectCall } from "./lib/api";
import { useEffect } from "react";

const AppContent = () => {
  const { isLoading, authUser } = useAuthUser();
  const { incomingCall, setIncomingCall, connectSocket } = useSocket();
  const navigate = useNavigate();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnBoarding;

  useEffect(() => {
    if (authUser?._id) {
      connectSocket(authUser._id);
    }
  }, [authUser]);

  const handleAcceptCall = async (call) => {
    try {
      console.log('Accepting call:', call);
      console.log('Caller ID:', call.callerId);
      await receiveCall(call.callId);
      setIncomingCall(null);
      // Use navigate instead of window.location to preserve socket
      navigate('/call', { 
        state: { 
          callData: { callId: call.callId, callType: call.callType },
          friendData: { _id: call.callerId },
          isReceiver: true
        } 
      });
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const handleRejectCall = async (call) => {
    try {
      await rejectCall(call.callId);
      setIncomingCall(null);
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme="forest">
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <HomePage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboard"} />
            )
          }
        />
        <Route
          path="/signup"
          element={!isAuthenticated ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/onboard"
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnBoardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated ? <NotificationPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/chat"
          element={
            isAuthenticated && isOnboarded ? (
              <GroupChatPage />
            ) : (
              <Navigate
                to={!isAuthenticated ? "/login" : "/onboard"}
              />
            )
          }
        />

        <Route
          path="/call"
          element={
            isAuthenticated ? (
              <CallPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/explore"
          element={
            isAuthenticated && isOnboarded ? (
              <ExplorePage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboard"} />
            )
          }
        />
        <Route
          path="/groups"
          element={
            isAuthenticated && isOnboarded ? (
              <GroupsPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboard"} />
            )
          }
        />
        <Route
          path="/friends"
          element={isAuthenticated ? <FriendsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/contact"
          element={
            isAuthenticated && isOnboarded ? (
              <ContactPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboard"} />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated && isOnboarded ? (
              <SettingsPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboard"} />
            )
          }
        />
      </Routes>
      <CallModal 
        incomingCall={incomingCall}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />
      <Toaster />
    </div>
  );
};

const App = () => {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
};

export default App;
