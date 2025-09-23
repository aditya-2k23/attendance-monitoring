import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface User {
  id: number;
  name: string;
  email: string;
  userId: string; // student/teacher ID
  role: "teacher" | "student";
  department?: string;
  courses?: string[];
  photoUri?: string; // photo URI
  status: "active" | "inactive";
}

interface AttendanceStats {
  department: string;
  totalStudents: number;
  presentToday: number;
  averageRate: number;
  atRiskCount: number;
}

interface FacultyPerformance {
  teacherId: number;
  name: string;
  scheduledClasses: number;
  conductedClasses: number;
  missedClasses: number;
  performanceRate: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<string>("overview");
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    userId: "",
    role: "student" as "teacher" | "student",
    department: "",
    photoUri: "",
  });

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

  const users: User[] = [
    {
      id: 1,
      name: "Dr. Sarah Wilson",
      email: "sarah.wilson@college.edu",
      userId: "TCH001",
      role: "teacher",
      department: "Computer Science",
      courses: ["Data Structures", "Algorithms"],
      photoUri: "https://via.placeholder.com/150x150/4CAF50/FFFFFF?text=SW",
      status: "active",
    },
    {
      id: 2,
      name: "John Doe",
      email: "john.doe@student.college.edu",
      userId: "STU2023001",
      role: "student",
      department: "Computer Science",
      photoUri: "https://via.placeholder.com/150x150/2196F3/FFFFFF?text=JD",
      status: "active",
    },
    {
      id: 3,
      name: "Prof. Emily Davis",
      email: "emily.davis@college.edu",
      userId: "TCH002",
      role: "teacher",
      department: "Mathematics",
      courses: ["Calculus I", "Linear Algebra"],
      photoUri: "https://via.placeholder.com/150x150/FF9800/FFFFFF?text=ED",
      status: "active",
    },
  ];

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

  const handleAddUser = () => {
    if (
      !newUser.name ||
      !newUser.email ||
      !newUser.userId ||
      !newUser.department
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    Alert.alert(
      "Success",
      `${newUser.role} ${newUser.name} (ID: ${newUser.userId}) has been added successfully`
    );
    setNewUser({
      name: "",
      email: "",
      userId: "",
      role: "student",
      department: "",
      photoUri: "",
    });
    setShowUserModal(false);
  };

  const handleTakePhoto = async () => {
    // Request camera permissions
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera is required to take photos."
      );
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewUser({ ...newUser, photoUri: result.assets[0].uri });
    }
  };

  const handleSelectPhoto = async () => {
    // Request media library permissions
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access photo library is required."
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewUser({ ...newUser, photoUri: result.assets[0].uri });
    }
  };

  const showPhotoOptions = () => {
    Alert.alert("Add Photo", "Choose how you want to add a photo", [
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Gallery", onPress: handleSelectPhoto },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleExportReport = (reportType: string) => {
    Alert.alert(
      "Export Report",
      `${reportType} report will be generated and downloaded shortly.`
    );
  };

  const renderOverview = () => (
    <View>
      {/* Global Statistics */}
      <View className="mb-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">
          Global Statistics
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow-md">
            <Text className="text-2xl font-bold text-blue-600">
              {totalStudents.toLocaleString()}
            </Text>
            <Text className="text-sm text-gray-600">Total Students</Text>
          </View>
          <View className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow-md">
            <Text className="text-2xl font-bold text-green-600">
              {overallAttendanceRate}%
            </Text>
            <Text className="text-sm text-gray-600">Overall Attendance</Text>
          </View>
          <View className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow-md">
            <Text className="text-2xl font-bold text-orange-600">
              {totalAtRisk}
            </Text>
            <Text className="text-sm text-gray-600">At-Risk Students</Text>
          </View>
          <View className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow-md">
            <Text className="text-2xl font-bold text-purple-600">
              {facultyPerformance.length}
            </Text>
            <Text className="text-sm text-gray-600">Active Faculty</Text>
          </View>
        </View>
      </View>

      {/* Department Attendance */}
      <View className="mb-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">
          Department-wise Attendance
        </Text>
        <View className="bg-white rounded-xl shadow-md">
          {attendanceStats.map((dept, index) => (
            <View
              key={dept.department}
              className={`p-4 ${index < attendanceStats.length - 1 ? "border-b border-gray-200" : ""}`}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base font-semibold text-gray-900">
                  {dept.department}
                </Text>
                <Text
                  className={`text-base font-bold ${dept.averageRate >= 90 ? "text-green-600" : dept.averageRate >= 80 ? "text-orange-600" : "text-red-600"}`}
                >
                  {dept.averageRate}%
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">
                  {dept.presentToday}/{dept.totalStudents} present today
                </Text>
                <Text className="text-sm text-red-600">
                  {dept.atRiskCount} at-risk
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderUserManagement = () => (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-gray-900">
          User Management
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-lg"
          onPress={() => setShowUserModal(true)}
        >
          <Text className="text-white font-semibold">Add User</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white rounded-xl shadow-md">
        {users.map((user, index) => (
          <View
            key={user.id}
            className={`p-4 ${index < users.length - 1 ? "border-b border-gray-200" : ""}`}
          >
            <View className="flex-row justify-between items-start">
              {/* User Photo */}
              <View className="mr-3">
                {user.photoUri ? (
                  <Image
                    source={{ uri: user.photoUri }}
                    className="w-12 h-12 rounded-full bg-gray-200"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-gray-300 justify-center items-center">
                    <Text className="text-lg font-semibold text-gray-600">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-base font-semibold text-gray-900 mr-2">
                    {user.name}
                  </Text>
                  <View
                    className={`px-2 py-1 rounded-full ${user.role === "teacher" ? "bg-blue-100" : "bg-green-100"}`}
                  >
                    <Text
                      className={`text-xs font-semibold ${user.role === "teacher" ? "text-blue-700" : "text-green-700"}`}
                    >
                      {user.role.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-600 mb-1">{user.email}</Text>
                <Text className="text-sm text-gray-600 mb-1">
                  ID: {user.userId}
                </Text>
                <Text className="text-sm text-gray-600">{user.department}</Text>
                {user.courses && (
                  <Text className="text-xs text-gray-500 mt-1">
                    Courses: {user.courses.join(", ")}
                  </Text>
                )}
              </View>
              <View className="flex-row space-x-2">
                <TouchableOpacity className="bg-gray-100 px-3 py-1 rounded-lg">
                  <Text className="text-xs text-gray-700">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-red-100 px-3 py-1 rounded-lg">
                  <Text className="text-xs text-red-700">Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderReports = () => (
    <View>
      <Text className="text-xl font-semibold text-gray-900 mb-4">
        Reports & Analytics
      </Text>

      {/* Export Options */}
      <View className="bg-white rounded-xl p-4 shadow-md mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Export Reports
        </Text>
        <View className="space-y-3">
          <TouchableOpacity
            className="bg-green-600 p-3 rounded-lg"
            onPress={() => handleExportReport("Monthly Attendance CSV")}
          >
            <Text className="text-white font-semibold text-center">
              Export Monthly Attendance (CSV)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-600 p-3 rounded-lg"
            onPress={() => handleExportReport("Semester Report PDF")}
          >
            <Text className="text-white font-semibold text-center">
              Export Semester Report (PDF)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* At-Risk Students */}
      <View className="bg-white rounded-xl shadow-md">
        <View className="p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">
            At-Risk Students
          </Text>
          <Text className="text-sm text-gray-600">
            Students with attendance below 75%
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="p-4"
        >
          {attendanceStats.map((dept) => (
            <View
              key={dept.department}
              className="mr-4 bg-red-50 p-3 rounded-lg min-w-[150px]"
            >
              <Text className="text-sm font-semibold text-gray-900 mb-1">
                {dept.department}
              </Text>
              <Text className="text-2xl font-bold text-red-600 mb-1">
                {dept.atRiskCount}
              </Text>
              <Text className="text-xs text-gray-600">students at risk</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderFacultyPerformance = () => (
    <View>
      <Text className="text-xl font-semibold text-gray-900 mb-4">
        Faculty Performance
      </Text>
      <View className="bg-white rounded-xl shadow-md">
        {facultyPerformance.map((faculty, index) => (
          <View
            key={faculty.teacherId}
            className={`p-4 ${index < facultyPerformance.length - 1 ? "border-b border-gray-200" : ""}`}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-base font-semibold text-gray-900">
                {faculty.name}
              </Text>
              <Text
                className={`text-base font-bold ${faculty.performanceRate >= 95 ? "text-green-600" : faculty.performanceRate >= 90 ? "text-orange-600" : "text-red-600"}`}
              >
                {faculty.performanceRate}%
              </Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Scheduled Classes</Text>
              <Text className="text-sm text-gray-900">
                {faculty.scheduledClasses}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Conducted Classes</Text>
              <Text className="text-sm text-green-600">
                {faculty.conductedClasses}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Missed Classes</Text>
              <Text className="text-sm text-red-600">
                {faculty.missedClasses}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
          onPress={() => router.back()}
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
        {selectedSection === "overview" && renderOverview()}
        {selectedSection === "users" && renderUserManagement()}
        {selectedSection === "reports" && renderReports()}
        {selectedSection === "performance" && renderFacultyPerformance()}
      </ScrollView>

      {/* Add User Modal */}
      <Modal visible={showUserModal} transparent animationType="slide">
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View className="bg-white rounded-xl p-6 mx-4 w-full max-w-md">
              <Text className="text-xl font-semibold text-gray-900 mb-4">
                Add New User
              </Text>

              {/* Photo Section */}
              <View className="items-center mb-4">
                <View className="mb-2">
                  {newUser.photoUri ? (
                    <Image
                      source={{ uri: newUser.photoUri }}
                      className="w-24 h-24 rounded-full bg-gray-200"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-24 h-24 rounded-full bg-gray-300 justify-center items-center">
                      <Text className="text-2xl text-gray-600">📷</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  className="bg-blue-100 px-4 py-2 rounded-lg"
                  onPress={showPhotoOptions}
                >
                  <Text className="text-blue-700 font-semibold">
                    {newUser.photoUri ? "Change Photo" : "Add Photo"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-3"
                placeholder="Full Name *"
                value={newUser.name}
                onChangeText={(text) => setNewUser({ ...newUser, name: text })}
              />

              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-3"
                placeholder="Email Address *"
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                keyboardType="email-address"
              />

              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-3"
                placeholder={`${newUser.role === "teacher" ? "Teacher" : "Student"} ID *`}
                value={newUser.userId}
                onChangeText={(text) =>
                  setNewUser({ ...newUser, userId: text })
                }
              />

              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-3"
                placeholder="Department *"
                value={newUser.department}
                onChangeText={(text) =>
                  setNewUser({ ...newUser, department: text })
                }
              />

              <View className="flex-row justify-between mb-4">
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg mr-2 ${newUser.role === "teacher" ? "bg-blue-600" : "bg-gray-200"}`}
                  onPress={() => setNewUser({ ...newUser, role: "teacher" })}
                >
                  <Text
                    className={`text-center font-semibold ${newUser.role === "teacher" ? "text-white" : "text-gray-700"}`}
                  >
                    Teacher
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg ml-2 ${newUser.role === "student" ? "bg-blue-600" : "bg-gray-200"}`}
                  onPress={() => setNewUser({ ...newUser, role: "student" })}
                >
                  <Text
                    className={`text-center font-semibold ${newUser.role === "student" ? "text-white" : "text-gray-700"}`}
                  >
                    Student
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-xs text-gray-500 mb-3 text-center">
                * Required fields
              </Text>

              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="flex-1 bg-gray-200 p-3 rounded-lg mr-2"
                  onPress={() => setShowUserModal(false)}
                >
                  <Text className="text-center text-gray-700 font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-blue-600 p-3 rounded-lg ml-2"
                  onPress={handleAddUser}
                >
                  <Text className="text-center text-white font-semibold">
                    Add User
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
