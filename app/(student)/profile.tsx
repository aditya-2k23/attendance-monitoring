import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

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

export default function StudentProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const academicYearDisplay =
    typeof user?.enrollmentYear === "number"
      ? new Date().getFullYear() - user.enrollmentYear + 1
      : studentProfile.academicInfo.year;

  const handleLogout = () => {
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
              {user?.name.charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {user?.name || studentProfile.personalInfo.name}
            </Text>
            <Text className="text-sm text-blue-600">
              {studentProfile.academicInfo.major} • {academicYearDisplay}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
      >
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
                <Text className="text-sm text-gray-600">Current Semester</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {studentProfile.academicInfo.semester}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Academic Advisor</Text>
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
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Current GPA</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {studentProfile.academicInfo.currentGPA}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Total Credits</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {studentProfile.academicInfo.totalCredits}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
