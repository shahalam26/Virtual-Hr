import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../apiClient';
import { AppContent } from '../context/AppContextValue';

 const  Navbar =()=> {
  const navigate = useNavigate();
  const { userData, setUserData, setIsLoggedIn } = useContext(AppContent);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Logout function - unchanged, just added comments for readability
  const logout = async () => {
    try {
      const { data } = await api.post('/auth/logout');
      if (data.message === "Logged out successfully") {
        setIsLoggedIn(false);
        setUserData(null);
        toast.success('Logged out successfully!');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <nav className="w-full flex items-center justify-between px-10 py-5 bg-black bg-opacity-80 fixed top-0 left-0 z-50 shadow-md">
      
      {/* 🔹 Logo Section (merged your design) */}
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/')}
      >
        {/* Gradient Box with "AI" text */}
        <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-md flex items-center justify-center">
          <span className="text-white font-bold">AI</span>
        </div>
        {/* Brand Text */}
        <span className="font-semibold text-white text-lg">
          AI <span className="text-sky-400">Interviewer</span>
        </span>
      </div>

      {/* 🔹 Navbar Links (only visible on medium+ screens) */}
      <div className="hidden md:flex gap-8 text-gray-200">
        <button onClick={() => navigate('/')} className="hover:text-white cursor-pointer">Home</button>
        <button onClick={() => navigate('/demo')} className="hover:text-white cursor-pointer">Demo</button>
        <button onClick={() => navigate('/features')} className="hover:text-white cursor-pointer">Features</button>
        <button onClick={() => navigate('/pricing')} className="hover:text-white cursor-pointer">Pricing</button>
        <button onClick={() => navigate('/about')} className="hover:text-white cursor-pointer">About</button>
      </div>

      {/* 🔹 Auth Section */}
      <div className="flex gap-4 items-center">
        {userData ? (
          // ✅ If logged in → show profile circle with logout option
          <div 
            ref={dropdownRef}
            className="w-8 h-8 flex justify-center items-center rounded-full bg-gray-800 cursor-pointer text-gray-100 relative"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {userData?.name?.[0]?.toUpperCase() || "U"}

            {isDropdownOpen && (
              <div className="absolute top-10 right-0 z-10 bg-[#101828] text-gray-200 border border-gray-700/50 rounded-xl shadow-2xl mt-2 w-44 overflow-hidden backdrop-blur-md">
                <ul className="text-sm list-none flex flex-col">
                  <li onClick={() => { navigate('/progress'); setIsDropdownOpen(false); }} className="hover:bg-gray-800 hover:text-sky-400 cursor-pointer px-4 py-3 transition-colors flex items-center gap-2">
                    My Progress
                  </li>
                  <li onClick={() => { navigate('/interview/video'); setIsDropdownOpen(false); }} className="hover:bg-gray-800 hover:text-sky-400 cursor-pointer px-4 py-3 transition-colors flex items-center gap-2">
                    Video Interview
                  </li>
                  <li onClick={() => { logout(); setIsDropdownOpen(false); }} className="hover:bg-red-500/10 hover:text-red-400 text-red-400 cursor-pointer border-t border-gray-700/50 px-4 py-3 transition-colors flex items-center gap-2">
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          // ✅ If NOT logged in → show Login + Signup buttons
          <>
            <button
              onClick={() => navigate('/login')}
              className="text-gray-200 hover:text-white"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-sky-400 to-indigo-500 text-white px-5 py-2 rounded-full shadow-md hover:opacity-90 transition"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
export default Navbar;
