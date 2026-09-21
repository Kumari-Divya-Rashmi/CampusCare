import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { API_BASE_URL } from "../config/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const register = async (formData) => {
    const response = await fetch(
      `${API_BASE_URL}/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Registration failed"
      );
    }

    localStorage.setItem(
      "campuscare_token",
      data.token
    );

    setUser(data.user);

    return data.user;
  };

  const login = async (email, password) => {
    const response = await fetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Login failed"
      );
    }

    localStorage.setItem(
      "campuscare_token",
      data.token
    );

    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(
      "campuscare_token"
    );

    setUser(null);
  };

  useEffect(() => {
    const loadLoggedInUser = async () => {
      const token = localStorage.getItem(
        "campuscare_token"
      );

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Invalid token");
        }

        const data = await response.json();

        setUser(data.user);
      } catch (error) {
        localStorage.removeItem(
          "campuscare_token"
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadLoggedInUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};