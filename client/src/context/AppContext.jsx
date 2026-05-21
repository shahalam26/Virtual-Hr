import React, { useState, useEffect } from "react";
import api from "../apiClient";
import { BACKEND_URL } from "../config/api";
import { AppContent } from "./AppContextValue";

export const AppProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }

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
