import React, { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const NAVBAR_HEIGHT = 64; // px -> same as Tailwind h-16

const Layout = ({ children, showSidebar = true, showNavbar = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading, authUser } = useAuthUser();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-base-200" data-theme="forest">
      {/* Navbar */}
      {showNavbar && (
        <div className="h-16">
          <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            fullName={authUser.fullName}
            profilePic={authUser.profilePic}
          />
        </div>
      )}

      {/* Content Row */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar sidebarOpen={sidebarOpen} />
        )}

        {/* Main Content */}
        <main className="flex-1 h-[calc(100vh-64px)] overflow-y-auto px-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
