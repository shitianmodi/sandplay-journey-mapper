
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  hasConsent: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setConsent: (value: boolean) => void;
  username: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    // In a real app, this would validate against a backend
    // For demo purposes, accept any non-empty username/password
    if (username && password) {
      setIsAuthenticated(true);
      setUsername(username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setHasConsent(false);
    setUsername(null);
  };

  const setConsent = (value: boolean) => {
    setHasConsent(value);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        hasConsent,
        login,
        logout,
        setConsent,
        username
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
