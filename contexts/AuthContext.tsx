import { supabase } from "@/utils/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  userId?: string; // roll_no for students, teacher_code for teachers
  department?: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    // Skip auth check during SSR
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await loadUserProfile(session.user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      // First check if it's an admin by checking user metadata
      const userMetadata = authUser.user_metadata;
      if (userMetadata?.role === "admin") {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          role: "admin",
          name: userMetadata.full_name || "Admin User",
        });
        return;
      }

      // Try to find in students table first
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("auth_user_id", authUser.id)
        .single();

      if (studentData && !studentError) {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          role: "student",
          name: studentData.full_name,
          userId: studentData.id?.toString(), // Use database ID as fallback
          department: studentData.department,
          photoUrl: studentData.photo_url,
        });
        return;
      }

      // Try to find in teachers table
      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("*")
        .eq("auth_user_id", authUser.id)
        .single();

      if (teacherData && !teacherError) {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          role: "teacher",
          name: teacherData.full_name,
          userId: teacherData.teacher_code,
          department: teacherData.department,
          photoUrl: teacherData.photo_url,
        });
        return;
      }

      // If not found in either table, this might be a new user or admin
      // Check if email contains admin keywords as fallback
      if (authUser.email?.includes("admin") || userMetadata?.role) {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          role: userMetadata?.role || "admin",
          name: userMetadata?.full_name || authUser.email!,
        });
      } else {
        console.warn("User profile not found in students or teachers table");
        setUser({
          id: authUser.id,
          email: authUser.email!,
          role: "student", // default role
          name: userMetadata?.full_name || authUser.email!,
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        await loadUserProfile(data.user);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await loadUserProfile(session.user);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    refreshUser,
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
