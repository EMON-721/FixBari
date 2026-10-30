"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, jobsApi } from "@/lib/api";
import { storage } from "@/lib/storage";
import type { User, AuthState, LoginResponse, RegisterData } from "@/types/auth";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
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

          // Check if user is a technician
          if (user.role !== "TECHNICIAN") {
            storage.clearAuth();
            setState({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          // Sync technician profile on session init (for existing users)
          jobsApi.syncProfile(
            {
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
            },
            token
          ).catch(() => {});

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
                if (user.role !== "TECHNICIAN") {
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

      // Check if user is a technician
      if (response.user.role !== "TECHNICIAN") {
        throw new Error("Access denied. Technician accounts only.");
      }

      storage.setAccessToken(response.accessToken);
      storage.setRefreshToken(response.refreshToken);
      storage.setUser(response.user);

      // Sync technician profile to orders service (fire and forget)
      jobsApi.syncProfile(
        {
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phone: response.user.phone,
        },
        response.accessToken
      ).catch(() => {
        // Silently ignore sync errors - profile will be created on next login
      });

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      router.push("/");
    },
    [router]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      // Always register as technician
      const response = (await authApi.register({
        ...data,
        role: "TECHNICIAN",
      })) as LoginResponse;

      storage.setAccessToken(response.accessToken);
      storage.setRefreshToken(response.refreshToken);
      storage.setUser(response.user);

      // Sync technician profile to orders service (fire and forget)
      jobsApi.syncProfile(
        {
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phone: response.user.phone,
        },
        response.accessToken
      ).catch(() => {
        // Silently ignore sync errors - profile will be created on next login
      });

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      router.push("/");
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
      value={{ ...state, login, register, logout, refreshSession }}
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
