import React, { createContext, ReactNode, useContext, useState } from "react";

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  userId: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userId: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (
    userId: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate API call - replace with actual authentication logic
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock authentication logic - replace with real authentication
      const mockUsers = {
        teacher123: {
          password: "password123",
          name: "Dr. John Smith",
          role: "teacher" as UserRole,
        },
        student456: {
          password: "password456",
          name: "Alice Johnson",
          role: "student" as UserRole,
        },
        admin789: {
          password: "admin123",
          name: "Admin User",
          role: "admin" as UserRole,
        },
      };

      const mockUser = mockUsers[userId as keyof typeof mockUsers];

      if (
        mockUser &&
        mockUser.password === password &&
        mockUser.role === role
      ) {
        const authenticatedUser: User = {
          id: Date.now().toString(),
          userId,
          role,
          name: mockUser.name,
        };

        setUser(authenticatedUser);
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
