import { createContext, useContext, useMemo, useState } from "react";
import { getOwnerId, resetOwnerId } from "@/api/client";

// Local demo account: no paid auth service. Each browser gets its own workspace id;
// projects are stored server-side under that id.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [ownerId, setOwnerId] = useState(() => getOwnerId());
  const value = useMemo(
    () => ({
      user: { id: ownerId, name: "Demo founder", email: "demo@tastebridge.local" },
      isAuthenticated: true,
      ownerId,
      /** Start a fresh, empty workspace in this browser. */
      resetWorkspace: () => {
        resetOwnerId();
        setOwnerId(getOwnerId());
      },
    }),
    [ownerId]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
