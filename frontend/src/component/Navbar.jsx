import { Menu, X, LogOut } from "lucide-react";
import { Link } from "react-router";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";
import toast from "react-hot-toast";

const Navbar = ({ sidebarOpen, setSidebarOpen, fullName, profilePic }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("logout Successful!");
    },
    onError: () => {
          toast.error(error.res.data.message);
        },
  });
  const handleLogout = () => {
    mutate();
    console.log("User logged out!");
    setShowConfirm(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 bg-base-100 shadow-lg relative">
      {/* Logo + User Info */}
      <div className="p-2 border-b border-base-300 flex gap-4 sm:gap-28 items-center">
        <Link to="/">
          <h1
            className="text-xl sm:text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r 
                       from-green-400 via-blue-500 to-purple-500 animate-gradient"
            style={{ backgroundSize: "200% 200%" }}
          >
            Linkee
          </h1>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <img
            src={profilePic}
            alt="User Avatar"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-green-400"
          />
          <span className="hidden sm:block text-sm sm:text-base">{fullName}</span>
        </div>
      </div>

      {/* Sidebar Toggle (mobile) */}
      <button
        className="sm:hidden p-2 rounded-lg hover:bg-base-300"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Logout + Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setShowConfirm(!showConfirm)}>
          <LogOut size={20} className="sm:w-6 sm:h-6 cursor-pointer hover:text-red-500" />
        </button>

        {showConfirm && (
          <div className="absolute right-0 mt-2 w-60 bg-base-100 border border-base-300 shadow-lg rounded-xl p-4 z-50">
            <h3 className="font-bold text-lg">Confirm Logout</h3>
            <p className="text-sm py-2">Do you really want to log out?</p>
            <div className="flex justify-end gap-2 mt-3">
              <button
                className="btn btn-error btn-sm px-6"
                onClick={handleLogout}
              >
                Yes
              </button>
              <button
                className="btn btn-sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
