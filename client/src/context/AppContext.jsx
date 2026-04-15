import React, { useState, useEffect } from "react";
import api from "../apiClient";
import { BACKEND_URL } from "../config/api";
import { AppContent } from "./AppContextValue";

export const AppProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me"); // 👈 cookie sent automatically
        setUserData(res.data);
        setIsLoggedIn(true);
      } catch (err) {
        console.log(err.message)
        console.error("fetchUser error:", err.response?.data || err.message);
        setUserData(null);
        setIsLoggedIn(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AppContent.Provider
      value={{
        userData,
        setUserData,
        isLoggedIn,
        setIsLoggedIn,
        backendUrl: BACKEND_URL,
      }}
    >
      {children}
    </AppContent.Provider>
  );
};
