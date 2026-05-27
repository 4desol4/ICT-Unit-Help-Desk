import { createContext, useContext, useState, useEffect } from "react";
import { setToken, clearToken } from "../api";
import { initializePushNotifications } from "../notificationService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Restore user from localStorage on page refresh
    const saved = localStorage.getItem("ict_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (userData, token) => {
    setToken(token);
    localStorage.setItem("ict_user", JSON.stringify(userData));
    setUser(userData);

    try {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        "serviceWorker" in navigator
      ) {
        console.log(
          "[Push] AuthContext login: permission is",
          Notification.permission,
        );

        if (Notification.permission === "default") {
          const result = await Notification.requestPermission();
          console.log("[Push] AuthContext permission result:", result);

          if (result === "granted") {
            await initializePushNotifications();
          }
        } else if (Notification.permission === "granted") {
          await initializePushNotifications();
        }
      }
    } catch (err) {
      console.warn(
        "[Push] AuthContext login registration failed:",
        err?.message || err,
      );
    }
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem("ict_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Easy hook to use auth anywhere
export const useAuth = () => useContext(AuthContext);
