// src/contexts/UIContext.tsx
import { createContext, useState, ReactNode } from "react";

export type AppMode = "research" | "shopping";

interface UIContextType {
  mode: AppMode;
  setMode: (m: AppMode) => void;
}

export const UIContext = createContext<UIContextType | null>(null);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<AppMode>("research");

  return (
    <UIContext.Provider value={{ mode, setMode }}>
      {children}
    </UIContext.Provider>
  );
};
