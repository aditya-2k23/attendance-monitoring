import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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

// Mock student profile data
const studentProfile = {
  personalInfo: {
    name: "Alice Johnson",
    studentId: "STU-2024-001",
    email: "alice.johnson@university.edu",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1999-05-15",
    address: "123 University Ave, College Town, ST 12345",
  },
  academicInfo: {
    major: "Computer Science",
    minor: "Mathematics",
    year: "Junior",
    semester: "Fall 2025",
    advisor: "Dr. Sarah Wilson",
    expectedGraduation: "Spring 2026",
    currentGPA: 3.7,
    totalCredits: 78,
  },
  emergencyContact: {
    name: "John Johnson",
    relationship: "Father",
    phone: "+1 (555) 987-6543",
    email: "john.johnson@email.com",
  },
  preferences: {
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      assignmentReminders: true,
      gradeUpdates: true,
      attendanceAlerts: true,
    },
    privacy: {
      showProfileToClassmates: true,
      allowContactFromInstructors: true,
      shareAcademicProgress: false,
    },
  },
};

const quickActions = [
  {
    id: 1,
    title: "Update Contact Info",
    icon: "contact-mail" as const,
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Change Password",
    icon: "lock" as const,
    color: "bg-green-500",
  },
  {
    id: 3,
    title: "Academic Calendar",
    icon: "calendar-today" as const,
    color: "bg-purple-500",
  },
  {
    id: 4,
    title: "Student Handbook",
    icon: "menu-book" as const,
    color: "bg-orange-500",
  },
];

export default function StudentProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState<
    "personal" | "academic" | "settings"
  >("personal");

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

  const handleQuickAction = (actionId: number) => {
    const actions = {
      1: "This would open the contact information update form.",
      2: "This would open the password change form.",
      3: "This would show the academic calendar.",
      4: "This would open the student handbook.",
    };

    Alert.alert("Quick Action", actions[actionId as keyof typeof actions], [
      { text: "OK" },
    ]);
  };

  const toggleNotification = (type: string) => {
    Alert.alert(
      "Notification Settings",
      `This would toggle ${type} notifications.`,
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-xl font-semibold text-gray-900">Profile</Text>
            <Text className="text-sm text-gray-600 mt-1">
              Manage your account settings
            </Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-red-100 justify-center items-center"
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Header */}
      <View className="bg-white px-5 py-6 border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-blue-500 justify-center items-center mr-4">
            <Text className="text-2xl font-bold text-white">
              {studentProfile.personalInfo.name.charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {studentProfile.personalInfo.name}
            </Text>
            <Text className="text-sm text-gray-600">
              {studentProfile.personalInfo.studentId}
            </Text>
            <Text className="text-sm text-blue-600">
              {studentProfile.academicInfo.major} •{" "}
              {studentProfile.academicInfo.year}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <Text className="text-sm font-semibold text-gray-900 mb-3">
          Quick Actions
        </Text>
        <View className="flex-row justify-between">
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              className="items-center flex-1"
              onPress={() => handleQuickAction(action.id)}
            >
              <View
                className={`w-12 h-12 rounded-full justify-center items-center ${action.color} mb-2`}
              >
                <MaterialIcons name={action.icon} size={20} color="white" />
              </View>
              <Text className="text-xs text-gray-600 text-center">
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white px-5 py-3 border-b border-gray-200">
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            className={`flex-1 py-2 px-4 rounded-md ${
              selectedTab === "personal" ? "bg-white shadow-sm" : ""
            }`}
            onPress={() => setSelectedTab("personal")}
          >
            <Text
              className={`text-center text-sm font-medium ${
                selectedTab === "personal" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Personal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 px-4 rounded-md ${
              selectedTab === "academic" ? "bg-white shadow-sm" : ""
            }`}
            onPress={() => setSelectedTab("academic")}
          >
            <Text
              className={`text-center text-sm font-medium ${
                selectedTab === "academic" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Academic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 px-4 rounded-md ${
              selectedTab === "settings" ? "bg-white shadow-sm" : ""
            }`}
            onPress={() => setSelectedTab("settings")}
          >
            <Text
              className={`text-center text-sm font-medium ${
                selectedTab === "settings" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
      >
        {selectedTab === "personal" && (
          <View className="space-y-4">
            {/* Personal Information */}
            <View className="bg-white rounded-xl p-4 shadow-md">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </Text>
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Full Name</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.personalInfo.name}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Student ID</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.personalInfo.studentId}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Email</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.personalInfo.email}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Phone</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.personalInfo.phone}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Date of Birth</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {new Date(
                      studentProfile.personalInfo.dateOfBirth
                    ).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Emergency Contact */}
            <View className="bg-white rounded-xl p-4 shadow-md">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Emergency Contact
              </Text>
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Name</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.emergencyContact.name}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Relationship</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.emergencyContact.relationship}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Phone</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.emergencyContact.phone}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Email</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.emergencyContact.email}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {selectedTab === "academic" && (
          <View className="space-y-4">
            {/* Academic Information */}
            <View className="bg-white rounded-xl p-4 shadow-md">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Academic Information
              </Text>
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Major</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.academicInfo.major}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Minor</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.academicInfo.minor}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Academic Year</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.academicInfo.year}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">
                    Current Semester
                  </Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.academicInfo.semester}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">
                    Academic Advisor
                  </Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.academicInfo.advisor}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">
                    Expected Graduation
                  </Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {studentProfile.academicInfo.expectedGraduation}
                  </Text>
                </View>
              </View>
            </View>

            {/* Academic Performance */}
            <View className="bg-white rounded-xl p-4 shadow-md">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Academic Performance
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-blue-500">
                    {studentProfile.academicInfo.currentGPA}
                  </Text>
                  <Text className="text-xs text-gray-600 text-center">
                    Current GPA
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-green-500">
                    {studentProfile.academicInfo.totalCredits}
                  </Text>
                  <Text className="text-xs text-gray-600 text-center">
                    Credits Earned
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-purple-500">
                    85%
                  </Text>
                  <Text className="text-xs text-gray-600 text-center">
                    Completion
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {selectedTab === "settings" && (
          <View className="space-y-4">
            {/* Notification Settings */}
            <View className="bg-white rounded-xl p-4 shadow-md">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Notification Preferences
              </Text>
              <View className="space-y-4">
                {Object.entries(studentProfile.preferences.notifications).map(
                  ([key, value]) => (
                    <TouchableOpacity
                      key={key}
                      className="flex-row justify-between items-center"
                      onPress={() => toggleNotification(key)}
                    >
                      <Text className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Text>
                      <View
                        className={`w-12 h-6 rounded-full ${value ? "bg-blue-500" : "bg-gray-300"}`}
                      >
                        <View
                          className={`w-5 h-5 rounded-full bg-white m-0.5 ${value ? "ml-6" : "ml-0.5"}`}
                        />
                      </View>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Privacy Settings */}
            <View className="bg-white rounded-xl p-4 shadow-md">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Privacy Settings
              </Text>
              <View className="space-y-4">
                {Object.entries(studentProfile.preferences.privacy).map(
                  ([key, value]) => (
                    <TouchableOpacity
                      key={key}
                      className="flex-row justify-between items-center"
                      onPress={() => toggleNotification(key)}
                    >
                      <Text className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Text>
                      <View
                        className={`w-12 h-6 rounded-full ${value ? "bg-blue-500" : "bg-gray-300"}`}
                      >
                        <View
                          className={`w-5 h-5 rounded-full bg-white m-0.5 ${value ? "ml-6" : "ml-0.5"}`}
                        />
                      </View>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Account Actions */}
            <View className="bg-white rounded-xl p-4 shadow-md">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Account Actions
              </Text>
              <View className="space-y-3">
                <TouchableOpacity className="flex-row items-center py-2">
                  <MaterialIcons name="sync" size={20} color="#3b82f6" />
                  <Text className="text-sm text-gray-700 ml-3">Sync Data</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center py-2">
                  <MaterialIcons name="download" size={20} color="#10b981" />
                  <Text className="text-sm text-gray-700 ml-3">
                    Export Data
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center py-2">
                  <MaterialIcons name="help" size={20} color="#f59e0b" />
                  <Text className="text-sm text-gray-700 ml-3">
                    Help & Support
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center py-2"
                  onPress={handleLogout}
                >
                  <MaterialIcons name="logout" size={20} color="#dc2626" />
                  <Text className="text-sm text-red-600 ml-3">Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
