import React, { createContext, useContext, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/query-client";
import type { Profile } from "@shared/schema";

interface AuthUser {
  id: string;
  email: string;
  emailVerified?: boolean;
}

interface AuthData {
  user: AuthUser;
  profile: Profile | null;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsEmailVerification: boolean;
  needsConsent: boolean;
  needsOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  completeProfileSetup: (data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    biologicalSex: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  needsEmailVerification: false,
  needsConsent: false,
  needsOnboarding: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  completeProfileSetup: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: authData,
    isLoading,
  } = useQuery<AuthData | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const user = authData?.user ?? null;
  const profile = authData?.profile ?? null;
  const isAuthenticated = !!user;
  const needsEmailVerification = isAuthenticated && !user?.emailVerified && !profile?.onboardingCompleted;
  const needsConsent = isAuthenticated && !!user?.emailVerified && !(profile as any)?.consentAcceptedAt && !profile?.onboardingCompleted;
  const needsOnboarding = isAuthenticated && !profile?.onboardingCompleted && !!user?.emailVerified && !!(profile as any)?.consentAcceptedAt;

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await apiRequest("POST", "/api/auth/login", { email, password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      await apiRequest("POST", "/api/auth/signup", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
    },
  });

  const profileSetupMutation = useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      biologicalSex: string;
    }) => {
      await apiRequest("PUT", "/api/profile/setup", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation],
  );

  const signup = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      await signupMutation.mutateAsync(data);
    },
    [signupMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const completeProfileSetup = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      biologicalSex: string;
    }) => {
      await profileSetupMutation.mutateAsync(data);
    },
    [profileSetupMutation],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated,
        needsEmailVerification,
        needsConsent,
        needsOnboarding,
        login,
        signup,
        logout,
        completeProfileSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
