import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as storageLogin, logout as storageLogout } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const loggedInUser = storageLogin(username, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return loggedInUser;
    }
    return null;
  };

  const logout = () => {
    storageLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
