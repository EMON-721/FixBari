"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { storage } from "@/lib/storage";
import type { User, AuthState, LoginResponse, RegisterData } from "@/types/auth";

const ALLOWED_ROLE = "CUSTOMER";
function afterCustomerSignIn(): string {
  // Only permit local paths; never allow a redirect to an external site.
  const requested = new URLSearchParams(window.location.search).get("redirect");
  if (requested && requested.startsWith("/") && !requested.startsWith("//") && !requested.includes("\\")) {
    return requested;
  }
  return "/dashboard";
}


interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await authApi.refreshToken(refreshToken);
      storage.setAccessToken(response.accessToken);
      storage.setRefreshToken(response.refreshToken);
      return true;
    } catch {
      storage.clearAuth();
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = storage.getAccessToken();
      const storedUser = storage.getUser();

      // Sync cookie with localStorage to prevent middleware/client mismatch
      if (token) {
        storage.setAccessToken(token);
      }

      if (token && storedUser) {
        try {
          const user = (await authApi.me(token)) as User;

          if (user.role !== ALLOWED_ROLE) {
            storage.clearAuth();
            setState({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          const refreshed = await refreshSession();
          if (!refreshed) {
            storage.clearAuth();
            setState({ user: null, isAuthenticated: false, isLoading: false });
          } else {
            const newToken = storage.getAccessToken();
            if (newToken) {
              try {
                const user = (await authApi.me(newToken)) as User;

                if (user.role !== ALLOWED_ROLE) {
                  storage.clearAuth();
                  setState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                  });
                  return;
                }

                setState({
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                });
              } catch {
                storage.clearAuth();
                setState({
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                });
              }
            }
          }
        }
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    initAuth();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = (await authApi.login(email, password)) as LoginResponse;

      if (response.user.role !== ALLOWED_ROLE) {
        throw new Error("Access denied. This portal is for customers only.");
      }

      storage.setAccessToken(response.accessToken);
      storage.setRefreshToken(response.refreshToken);
      storage.setUser(response.user);

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      router.push(afterCustomerSignIn());
    },
    [router]
  );

  const googleLogin = useCallback(async (credential: string) => {
    const response = (await authApi.google(credential)) as LoginResponse;
    if (response.user.role !== ALLOWED_ROLE) throw new Error("Customer access only");
    storage.setAccessToken(response.accessToken);
    storage.setRefreshToken(response.refreshToken);
    storage.setUser(response.user);
    setState({ user: response.user, isAuthenticated: true, isLoading: false });
    router.push(afterCustomerSignIn());
  }, [router]);

  const register = useCallback(
    async (data: RegisterData) => {
      const response = (await authApi.register({
        ...data,
        role: data.role === "TECHNICIAN" ? "TECHNICIAN" : "CUSTOMER",
      })) as LoginResponse;
      if (response.user.role !== "CUSTOMER") throw new Error("Unexpected registration role");

      storage.setAccessToken(response.accessToken);
      storage.setRefreshToken(response.refreshToken);
      storage.setUser(response.user);

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      const destination = afterCustomerSignIn();
      router.push(data.role === "TECHNICIAN" ? "/technician-application" : destination === "/dashboard" ? "/dashboard/profile?created=1" : destination);
    },
    [router]
  );

  const logout = useCallback(() => {
    storage.clearAuth();
    setState({ user: null, isAuthenticated: false, isLoading: false });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, googleLogin, register, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
