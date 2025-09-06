import { Link, useLocation } from "react-router";
import { Home, Users, Bell, Compass, UserCheck, Settings, User } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

const Sidebar = ({ sidebarOpen }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { unreadCount } = useNotifications();

  return (
    <div
      className={`fixed sm:static inset-y-0 right-0 sm:left-0 z-30 w-16 sm:w-20 lg:w-64 bg-base-100 shadow-xl transform transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "translate-x-full sm:translate-x-0"
      }`}
    >
      <nav className="mt-4 sm:mt-6 space-y-1 sm:space-y-2 flex flex-col items-center lg:items-start mx-0 px-2 sm:px-4">
        {/* Home */}
        <Link
          to="/"
          className={`flex items-center justify-center lg:justify-start gap-0 lg:gap-3 w-full px-2 sm:px-3 py-2 sm:py-3 rounded-2xl sm:rounded-3xl transition btn-ghost ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <Home size={20} className="sm:w-6 sm:h-6" />
          <span className="hidden lg:inline ml-3">Home</span>
        </Link>

        {/* Explore */}
        <Link
          to="/explore"
          className={`flex items-center justify-center lg:justify-start gap-0 lg:gap-3 w-full px-2 sm:px-3 py-2 sm:py-3 rounded-2xl sm:rounded-3xl transition btn-ghost ${
            currentPath === "/explore" ? "btn-active" : ""
          }`}
        >
          <Compass size={20} className="sm:w-6 sm:h-6" />
          <span className="hidden lg:inline ml-3">Explore</span>
        </Link>

        {/* Groups */}
        <Link
          to="/groups"
          className={`flex items-center justify-center lg:justify-start gap-0 lg:gap-3 w-full px-2 sm:px-3 py-2 sm:py-3 rounded-2xl sm:rounded-3xl transition btn-ghost ${
            currentPath === "/groups" ? "btn-active" : ""
          }`}
        >
          <UserCheck size={20} className="sm:w-6 sm:h-6" />
          <span className="hidden lg:inline ml-3">Groups</span>
        </Link>

        {/* Friends */}
        <Link
          to="/friends"
          className={`flex items-center justify-center lg:justify-start gap-0 lg:gap-3 w-full px-2 sm:px-3 py-2 sm:py-3 rounded-2xl sm:rounded-3xl transition btn-ghost ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <Users size={20} className="sm:w-6 sm:h-6" />
          <span className="hidden lg:inline ml-3">Friends</span>
        </Link>

        {/* Notifications */}
        <Link
          to="/notifications"
          className={`flex items-center justify-center lg:justify-start gap-0 lg:gap-3 w-full px-2 sm:px-3 py-2 sm:py-3 rounded-2xl sm:rounded-3xl transition btn-ghost relative ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
        >
          <div className="relative">
            <Bell size={20} className="sm:w-6 sm:h-6" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
          <span className="hidden lg:inline ml-3">Notifications</span>
        </Link>

        {/* Contact */}
        <Link
          to="/contact"
          className={`flex items-center justify-center lg:justify-start gap-0 lg:gap-3 w-full px-2 sm:px-3 py-2 sm:py-3 rounded-2xl sm:rounded-3xl transition btn-ghost ${
            currentPath === "/contact" ? "btn-active" : ""
          }`}
        >
          <User size={20} className="sm:w-6 sm:h-6" />
          <span className="hidden lg:inline ml-3">Contact</span>
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          className={`flex items-center justify-center lg:justify-start gap-0 lg:gap-3 w-full px-2 sm:px-3 py-2 sm:py-3 rounded-2xl sm:rounded-3xl transition btn-ghost ${
            currentPath === "/settings" ? "btn-active" : ""
          }`}
        >
          <Settings size={20} className="sm:w-6 sm:h-6" />
          <span className="hidden lg:inline ml-3">Settings</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
