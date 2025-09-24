import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AttendanceStats, FacultyPerformance, User } from "../../types/admin";
import AddUser from "./components/AddUser";
import Faculty from "./components/Faculty";
import Overview from "./components/Overview";
import Reports from "./components/Reports";
import Users from "./components/Users";

export default function AdminDashboard() {
  const [selectedSection, setSelectedSection] = useState<string>("overview");
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const { logout } = useAuth();

  // Mock data
  const attendanceStats: AttendanceStats[] = [
    {
      department: "Computer Science",
      totalStudents: 320,
      presentToday: 285,
      averageRate: 89,
      atRiskCount: 12,
    },
    {
      department: "Mathematics",
      totalStudents: 280,
      presentToday: 245,
      averageRate: 87,
      atRiskCount: 18,
    },
    {
      department: "Physics",
      totalStudents: 250,
      presentToday: 210,
      averageRate: 84,
      atRiskCount: 22,
    },
    {
      department: "Chemistry",
      totalStudents: 190,
      presentToday: 165,
      averageRate: 87,
      atRiskCount: 8,
    },
    {
      department: "Biology",
      totalStudents: 210,
      presentToday: 195,
      averageRate: 93,
      atRiskCount: 5,
    },
  ];

  const facultyPerformance: FacultyPerformance[] = [
    {
      teacherId: 1,
      name: "Dr. Sarah Wilson",
      scheduledClasses: 20,
      conductedClasses: 19,
      missedClasses: 1,
      performanceRate: 95,
    },
    {
      teacherId: 2,
      name: "Prof. John Smith",
      scheduledClasses: 18,
      conductedClasses: 18,
      missedClasses: 0,
      performanceRate: 100,
    },
    {
      teacherId: 3,
      name: "Dr. Emily Davis",
      scheduledClasses: 22,
      conductedClasses: 20,
      missedClasses: 2,
      performanceRate: 91,
    },
    {
      teacherId: 4,
      name: "Prof. Michael Brown",
      scheduledClasses: 16,
      conductedClasses: 14,
      missedClasses: 2,
      performanceRate: 87,
    },
  ];

  // Initialize users by fetching from database
  useEffect(() => {
    // Load users from database on component mount
    refreshUsers();
  }, []);

  // Function to refresh users list (fetch from database)
  const refreshUsers = async () => {
    try {
      // Fetch students and teachers from the database
      const [studentsResponse, teachersResponse] = await Promise.all([
        supabase.from("students").select("*"),
        supabase.from("teachers").select("*"),
      ]);

      if (studentsResponse.error) {
        console.error("Error fetching students:", studentsResponse.error);
        return;
      }

      if (teachersResponse.error) {
        console.error("Error fetching teachers:", teachersResponse.error);
        return;
      }

      // Transform database records to User interface
      const students: User[] = (studentsResponse.data || []).map(
        (student: any) => ({
          id: student.id,
          name: student.full_name,
          email: student.email,
          userId: student.id?.toString(), // Use database ID since there's no roll_no
          role: "student" as const,
          department: student.department,
          photoUri:
            student.photo_url ||
            "https://via.placeholder.com/150x150/2196F3/FFFFFF?text=" +
              student.full_name.charAt(0),
          status: student.is_active
            ? ("active" as const)
            : ("inactive" as const),
        })
      );

      const teachers: User[] = (teachersResponse.data || []).map(
        (teacher: any) => ({
          id: teacher.id,
          name: teacher.full_name,
          email: teacher.email,
          userId: teacher.teacher_code,
          role: "teacher" as const,
          department: teacher.department,
          courses: [], // You might want to fetch this from a separate table
          photoUri:
            teacher.photo_url ||
            "https://via.placeholder.com/150x150/4CAF50/FFFFFF?text=" +
              teacher.full_name.charAt(0),
          status: teacher.is_active
            ? ("active" as const)
            : ("inactive" as const),
        })
      );

      // Combine and set users
      setUsers([...students, ...teachers]);
    } catch (error) {
      console.error("Error refreshing users:", error);
      Alert.alert("Error", "Failed to refresh users list. Please try again.");
    }
  };

  const totalStudents = attendanceStats.reduce(
    (sum, stat) => sum + stat.totalStudents,
    0
  );
  const totalPresent = attendanceStats.reduce(
    (sum, stat) => sum + stat.presentToday,
    0
  );
  const totalAtRisk = attendanceStats.reduce(
    (sum, stat) => sum + stat.atRiskCount,
    0
  );
  const overallAttendanceRate = Math.round(
    (totalPresent / totalStudents) * 100
  );

  const handleExportReport = (reportType: string) => {
    Alert.alert(
      "Export Report",
      `${reportType} report will be generated and downloaded shortly.`
    );
  };

  const handleLogout = () => {
    // If web platform, use confirm dialog
    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to logout?")) {
        logout();
        router.replace("/auth/login");
      }
      return;
    }

    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
          onPress={handleLogout}
        >
          <Text className="text-xl text-gray-700">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Admin Dashboard
        </Text>
        <View className="w-10" />
      </View>
      {/* Navigation Tabs */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 py-3"
        >
          {[
            { key: "overview", label: "Overview" },
            { key: "users", label: "Users" },
            { key: "reports", label: "Reports" },
            { key: "performance", label: "Faculty" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`mr-4 px-4 py-2 rounded-lg ${
                selectedSection === tab.key ? "bg-blue-600" : "bg-gray-100"
              }`}
              onPress={() => setSelectedSection(tab.key)}
            >
              <Text
                className={`font-semibold ${
                  selectedSection === tab.key ? "text-white" : "text-gray-700"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
      >
        {selectedSection === "overview" && (
          <Overview
            attendanceStats={attendanceStats}
            totalStudents={totalStudents}
            totalAtRisk={totalAtRisk}
            overallAttendanceRate={overallAttendanceRate}
            facultyPerformance={facultyPerformance}
          />
        )}
        {selectedSection === "users" && (
          <Users users={users} onAddUser={() => setShowUserModal(true)} />
        )}
        {selectedSection === "reports" && (
          <Reports
            attendanceStats={attendanceStats}
            onExport={handleExportReport}
          />
        )}
        {selectedSection === "performance" && (
          <Faculty facultyPerformance={facultyPerformance} />
        )}
      </ScrollView>
      {/* Add User Component */}
      <AddUser
        visible={showUserModal}
        onClose={() => setShowUserModal(false)}
        onCreated={() => {}}
      />
    </SafeAreaView>
  );
}
