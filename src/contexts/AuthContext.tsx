// FULL PATH: src/contexts/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { mockApi, User } from "@/services/mockApi";
import { listenForResearchModeToggle } from "@/services/extensionBridge";

// Explicit context types
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface UIContextType {
  researchMode: boolean;
}

// Provide safe defaults so TS never fails on undefined
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

const UIContext = createContext<UIContextType>({
  researchMode: false,
});

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("taskoscope_token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    mockApi
      .getMe(storedToken)
      .then((u: User) => {
        setUser(u);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem("taskoscope_token");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await mockApi.login(email, password);
    localStorage.setItem("taskoscope_token", response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await mockApi.register(name, email, password);
    localStorage.setItem("taskoscope_token", response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem("taskoscope_token");
    setToken(null);
    setUser(null);
  };

  // UI state
  const [researchMode, setResearchMode] = useState(false);

  useEffect(() => {
    // Ensure the callback type is well-defined
    listenForResearchModeToggle((active: boolean) => {
      setResearchMode(active);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      <UIContext.Provider value={{ researchMode }}>
        {children}
      </UIContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useUI() {
  return useContext(UIContext);
}
