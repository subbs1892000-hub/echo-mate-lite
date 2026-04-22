import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem("echoMateLiteUser");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    localStorage.removeItem("echoMateLiteUser");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("echoMateLiteToken"));
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    if (token) {
      localStorage.setItem("echoMateLiteToken", token);
    } else {
      localStorage.removeItem("echoMateLiteToken");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("echoMateLiteUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("echoMateLiteUser");
    }
  }, [user]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("echomate:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("echomate:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
