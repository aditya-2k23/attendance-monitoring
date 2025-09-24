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

// Unified user profile capturing columns from admins, students, teachers tables.
// id represents the auth.users id (Supabase auth user id) to keep backwards compatibility.
// For table-specific primary keys we expose adminId / studentId / teacherId.
export interface User {
  // Auth identity
  id: string; // auth.users.id (legacy field kept for compatibility)
  authUserId: string; // duplicate of id for clarity in code elsewhere
  email: string;
  role: UserRole;
  // Display names
  name: string; // generic display name (maps to full_name or name)
  fullName?: string; // original full_name / name from table
  // Admin specific
  adminId?: string; // admins.id
  // Student specific
  studentId?: string; // students.id
  enrollmentYear?: number | null;
  // Teacher specific
  teacherId?: string; // teachers.id
  teacherCode?: string; // teachers.teacher_code
  // Common profile fields
  phone?: string | null;
  department?: string | null;
  photoUrl?: string | null; // photo_url camelCased
  isActive?: boolean | null;
  createdAt?: string; // created_at
  updatedAt?: string; // updated_at (where present)
  // Legacy convenience field used around the app (was roll_no / teacher_code / db id)
  userId?: string;
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
      const userMetadata = authUser.user_metadata || {};

      // 1. Admin lookup (explicit table first)
      const { data: adminData } = await supabase
        .from("admins")
        .select("*")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();

      if (adminData) {
        const adminUser: User = {
          id: authUser.id,
          authUserId: authUser.id,
          email: authUser.email || adminData.email || "",
          role: "admin",
          name:
            adminData.name ||
            userMetadata.full_name ||
            adminData.email ||
            "Admin User",
          fullName: adminData.name,
          adminId: adminData.id,
          phone: adminData.phone,
          isActive: adminData.is_active,
          createdAt: adminData.created_at,
          userId: adminData.id, // legacy convenience
        };
        setUser(adminUser);
        return;
      }

      // 2. Teacher lookup
      const { data: teacherData } = await supabase
        .from("teachers")
        .select("*")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();

      if (teacherData) {
        const teacherUser: User = {
          id: authUser.id,
          authUserId: authUser.id,
          email: authUser.email || teacherData.email || "",
          role: "teacher",
          name: teacherData.full_name,
          fullName: teacherData.full_name,
          teacherId: teacherData.id,
          teacherCode: teacherData.teacher_code,
          phone: teacherData.phone,
          department: teacherData.department,
          photoUrl: teacherData.photo_url,
          isActive: teacherData.is_active,
          createdAt: teacherData.created_at,
          updatedAt: teacherData.updated_at,
          userId: teacherData.teacher_code, // legacy convenience
        };
        setUser(teacherUser);
        return;
      }

      // 3. Student lookup
      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();

      if (studentData) {
        const studentUser: User = {
          id: authUser.id,
          authUserId: authUser.id,
          email: authUser.email || studentData.email || "",
          role: "student",
          name: studentData.full_name,
          fullName: studentData.full_name,
          studentId: studentData.id,
          phone: studentData.phone,
          department: studentData.department,
          enrollmentYear: studentData.enrollment_year,
          photoUrl: studentData.photo_url,
          isActive: studentData.is_active,
          createdAt: studentData.created_at,
          updatedAt: studentData.updated_at,
          userId: studentData.id, // legacy convenience
        };
        setUser(studentUser);
        return;
      }

      // 4. Fallback: derive from metadata or email heuristics
      const isAdminLike =
        userMetadata.role === "admin" || authUser.email?.includes("admin");
      if (isAdminLike) {
        setUser({
          id: authUser.id,
          authUserId: authUser.id,
          email: authUser.email || "",
          role: "admin",
          name: userMetadata.full_name || authUser.email || "Admin User",
          fullName: userMetadata.full_name,
          userId: authUser.id,
        });
        return;
      }

      // Default unknown user -> treat as student (least privileged) with minimal data
      console.warn(
        "User profile not found in admins, teachers, or students tables"
      );
      setUser({
        id: authUser.id,
        authUserId: authUser.id,
        email: authUser.email || "",
        role: "student",
        name: userMetadata.full_name || authUser.email || "Student User",
        fullName: userMetadata.full_name,
        userId: authUser.id,
      });
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
