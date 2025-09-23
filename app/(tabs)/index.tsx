import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
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
import { useAuth } from "../contexts/AuthContext";

export default function HomeTab() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Redirect students to their own portal
  useEffect(() => {
    if (user?.role === "student") {
      // For students, we'll show their dashboard here instead of redirecting
      // This way we avoid routing issues
    }
  }, [user]);

  const handleLogout = () => {
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "teacher":
        return "bg-green-500";
      case "student":
        return "bg-blue-500";
      case "admin":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "teacher":
        return "person";
      case "student":
        return "school";
      case "admin":
        return "admin-panel-settings";
      default:
        return "person";
    }
  };

  // If user is a student, show student dashboard
  if (user?.role === "student") {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        >
          {/* Student Header */}
          <View className="flex-row justify-between items-center mt-5 mb-8">
            <View className="flex-1">
              <Text className="text-2xl font-semibold text-gray-900 mb-1">
                Welcome back, {user?.name?.split(" ")[0] || "Student"}!
              </Text>
              <Text className="text-sm text-gray-600">
                Ready for today&apos;s learning journey?
              </Text>
            </View>
            <View className="relative">
              <TouchableOpacity
                className="w-12 h-12 rounded-full justify-center items-center bg-blue-500"
                onPress={handleLogout}
              >
                <MaterialIcons name="school" size={24} color="white" />
              </TouchableOpacity>
              <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 justify-center items-center">
                <MaterialIcons name="logout" size={12} color="white" />
              </View>
            </View>
          </View>

          {/* Student Stats */}
          <View className="flex-row justify-between mb-8">
            <View className="flex-1 bg-white rounded-xl p-4 mx-1 items-center shadow-md">
              <Text className="text-2xl font-bold text-green-600 mb-1">
                85%
              </Text>
              <Text className="text-xs text-gray-600 text-center">
                Attendance
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 mx-1 items-center shadow-md">
              <Text className="text-2xl font-bold text-orange-500 mb-1">3</Text>
              <Text className="text-xs text-gray-600 text-center">
                Pending Tasks
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 mx-1 items-center shadow-md">
              <Text className="text-2xl font-bold text-green-500 mb-1">
                3.7
              </Text>
              <Text className="text-xs text-gray-600 text-center">
                Current GPA
              </Text>
            </View>
          </View>

          {/* Student Notice */}
          <View className="bg-blue-100 rounded-xl p-4 mb-8 border border-blue-200">
            <Text className="text-blue-800 font-semibold mb-2">
              🎓 Student Portal
            </Text>
            <Text className="text-blue-700 text-sm">
              You&apos;re viewing the simplified student dashboard. The full
              student portal with detailed attendance tracking, assignments,
              grades, and profile management is available in the student tabs
              navigation.
            </Text>
          </View>

          {/* Basic Student Info */}
          <View className="bg-white rounded-xl p-5 shadow-md">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Quick Overview
            </Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Student ID</Text>
                <Text className="text-sm font-medium text-gray-900">
                  STU-2024-001
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Major</Text>
                <Text className="text-sm font-medium text-gray-900">
                  Computer Science
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Year</Text>
                <Text className="text-sm font-medium text-gray-900">
                  Junior
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Semester</Text>
                <Text className="text-sm font-medium text-gray-900">
                  Fall 2025
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Teacher/Admin Dashboard (existing code)
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      >
        {/* Greeting Header */}
        <View className="flex-row justify-between items-center mt-5 mb-8">
          <View className="flex-1">
            <Text className="text-2xl font-semibold text-gray-900 mb-1">
              Hello {user?.name || "User"}
            </Text>
            <Text className="text-sm text-gray-600">
              You&apos;re logged in as{" "}
              <Text className="text-blue-500 font-semibold capitalize">
                {user?.role}
              </Text>
            </Text>
          </View>
          <View className="relative">
            <TouchableOpacity
              className={`w-12 h-12 rounded-full justify-center items-center ${getRoleColor(user?.role || "")}`}
              onPress={handleLogout}
            >
              <MaterialIcons
                name={getRoleIcon(user?.role || "")}
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 justify-center items-center">
              <MaterialIcons name="logout" size={12} color="white" />
            </View>
          </View>
        </View>

        {/* Statistics Cards */}
        <View className="flex-row justify-between mb-8">
          <View className="flex-1 bg-white rounded-xl p-5 mx-1.5 items-center shadow-md">
            <Text className="text-3xl font-bold text-gray-900 mb-1">6</Text>
            <Text className="text-sm text-gray-600 text-center">
              Today&apos;s Classes
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-5 mx-1.5 items-center shadow-md">
            <Text className="text-3xl font-bold text-gray-900 mb-1">156</Text>
            <Text className="text-sm text-gray-600 text-center">
              Students Present
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-gray-900 mb-1">
            Quick Actions
          </Text>
          <Text className="text-sm text-gray-600 mb-5">
            Your running subjects
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="w-[48%] h-20 bg-pink-400 rounded-xl justify-center items-center mb-3 shadow-md">
              <Text className="text-white text-sm font-semibold text-center">
                Today&apos;s Classes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[48%] h-20 bg-pink-600 rounded-xl justify-center items-center mb-3 shadow-md"
              onPress={() => router.push("/attendance")}
            >
              <Text className="text-white text-sm font-semibold text-center">
                Lecture Attendance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-[48%] h-20 bg-indigo-600 rounded-xl justify-center items-center mb-3 shadow-md">
              <Text className="text-white text-sm font-semibold text-center">
                Track Attendance
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Schedule */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-gray-900 mb-1">
            Your schedule
          </Text>
          <Text className="text-sm text-gray-600 mb-5">
            Upcoming classes and tasks
          </Text>

          <View className="bg-white rounded-xl p-5 shadow-md">
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-1">
                Physics
              </Text>
              <Text className="text-sm text-gray-600">Chapter: 4 - Force</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <View className="items-start">
                <Text className="text-base font-semibold text-gray-900">
                  09:30
                </Text>
                <Text className="text-xs text-gray-600">Max. three</Text>
              </View>
              <Text className="text-sm text-gray-600">Hall room name</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
