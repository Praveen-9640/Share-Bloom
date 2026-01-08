import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // REGISTER USER (FIX ADDED)
  const register = async (data) => {
    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/register",
        data
      );

      if (!res.data.token) {
        return { success: false, message: res.data.message || "Registration failed" };
      }

      const newUser = res.data.user;

      // Save token + user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(newUser));

      setUser(newUser);
      setToken(res.data.token);

      return { success: true, user: newUser };

    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // LOGIN
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", {
        email,
        password,
      });

      if (!res.data.token) {
        return { success: false, message: res.data.message };
      }

      const loggedUser = res.data.user;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(loggedUser));

      setToken(res.data.token);
      setUser(loggedUser);

      return { success: true, user: loggedUser };

    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // UPDATE PROFILE
  const updateProfile = async (data) => {
    try {
      const res = await axios.put(
        "http://localhost:5001api/auth/profile",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.user;

      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);

      return { success: true };

    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Update failed",
      };
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        register,      // ✅ important
        login,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
