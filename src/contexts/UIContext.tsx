// C:/Users/Shrinjita Paul/Documents/GitHub/research-hub/src/contexts/UIContext.tsx

import { createContext } from "react";

export const UIContext = createContext(null);
export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  return <UIContext.Provider value={null}>{children}</UIContext.Provider>;
};
