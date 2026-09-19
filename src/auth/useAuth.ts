import { createContext, useContext } from "react";
import type { AuthContextValue } from "./authTypes";

export const AuthContext = createContext<AuthContextValue>({
  user: null, session: null, profile: null, status: "unconfigured", error: null, profileError: null,
  signInWithGoogle: async () => {}, signOut: async () => {}, refreshProfile: async () => {},
});
export const useAuth = () => useContext(AuthContext);
