import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { Subject, TeacherStats, TodaySchedule } from "../../types/teacher";
import { getTodaySchedule } from "../../utils/schedule";

export default function HomeTab() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<TodaySchedule | null>(null);
  
  // Mock data - In real app, fetch from API/database
  const todaySchedule = useMemo<TodaySchedule[]>(() => getTodaySchedule(), []);
  const [teacherStats] = useState<TeacherStats>({
    totalClasses: 12,
    classesToday: todaySchedule.length,
    studentsPresent: 156,
    totalStudents: 180,
    averageAttendance: 86.7,
    completedClasses: 8,
    pendingClasses: 4,
  });

  const [subjects] = useState<Subject[]>([
    {
      id: "1",
      name: "Data Structures",
      code: "CS301",
      department: "Computer Science",
      semester: "3rd",
      credits: 4,
      totalLectures: 40,
      completedLectures: 28,
      averageAttendance: 84.4,
    },
    {
      id: "2",
      name: "Database Systems",
      code: "CS401",
      department: "Computer Science",
      semester: "5th",
      credits: 3,
      totalLectures: 30,
      completedLectures: 22,
      averageAttendance: 87.5,
    },
    {
      id: "3",
      name: "Software Engineering",
      code: "CS501",
      department: "Computer Science",
      semester: "6th",
      credits: 4,
      totalLectures: 35,
      completedLectures: 25,
      averageAttendance: 91.7,
    },
  ]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "upcoming":
        return "bg-yellow-100 text-yellow-800";
      case "missed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderDashboard = () => (
    <>
      {/* Statistics Cards */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <View className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow-sm">
          <MaterialIcons name="class" size={24} color="#3b82f6" />
          <Text className="text-2xl font-bold text-gray-900 mt-2">{teacherStats.classesToday}</Text>
          <Text className="text-sm text-gray-600">Today's Classes</Text>
        </View>
        <View className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow-sm">
          <MaterialIcons name="trending-up" size={24} color="#f59e0b" />
          <Text className="text-2xl font-bold text-gray-900 mt-2">{teacherStats.averageAttendance}%</Text>
          <Text className="text-sm text-gray-600">Avg Attendance</Text>
        </View>
      </View>

      {/* Today's Schedule moved below Quick Actions */}

      {/* Quick Actions */}
      <View className="mb-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</Text>
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity 
            className="w-[48%] bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 mb-3 shadow-sm"
            onPress={() => router.push("/(faculty)/subjects")}
          >
            <MaterialIcons name="subject" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">My Subjects</Text>
            <Text className="text-blue-100 text-sm">{subjects.length} Active</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-[48%] bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 mb-3 shadow-sm"
            onPress={() => router.push("/(faculty)/reports")}
          >
            <MaterialIcons name="assessment" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">Reports</Text>
            <Text className="text-green-100 text-sm">View Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-[48%] bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 mb-3 shadow-sm"
            onPress={() => router.push("/(faculty)/timetable")}
          >
            <MaterialIcons name="schedule" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">Manage Schedule</Text>
            <Text className="text-purple-100 text-sm">Add & Edit Classes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-[48%] bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 mb-3 shadow-sm"
            onPress={() => router.push("/attendance")}
          >
            <MaterialIcons name="how-to-reg" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">Track Attendance</Text>
            <Text className="text-pink-100 text-sm">Mark & Monitor</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Schedule (below Quick Actions) */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-semibold text-gray-900">Today's Schedule</Text>
          <TouchableOpacity onPress={() => router.push("/(faculty)/timetable" as any)}>
            <Text className="text-blue-600 font-medium">View All</Text>
          </TouchableOpacity>
        </View>

        {todaySchedule.map((classItem) => (
          <View key={classItem.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">{classItem.subject}</Text>
                <Text className="text-sm text-gray-600">{classItem.semester} Semester • Section {classItem.section}</Text>
                <Text className="text-sm text-gray-600">{classItem.roomNumber} • {classItem.totalStudents} Students</Text>
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-blue-600">{classItem.time}</Text>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(classItem.status)}`}>
                  <Text className={`text-xs font-medium capitalize ${getStatusColor(classItem.status).split(' ')[1]}`}>
                    {classItem.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Marked Attendance removed as requested */}
    </>
  );

  // Teacher/Faculty Dashboard
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      
      {/* Header removed as requested */}
        <View className="flex-row justify-between items-center mt-5 mb-8">
          <View className="flex-1">
            <Text className="text-2xl font-semibold text-gray-900 mb-1">
              Hello {user?.name || "User"}!
            </Text>
            <Text className="text-sm text-gray-600">
              You&apos;re logged in as{" "}
              <Text className="text-blue-500 font-semibold capitalize">
                {user?.role}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-red-500 justify-center items-center"
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
  
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {renderDashboard()}
      </ScrollView>

      {/* Attendance Modal */}
      <Modal
        visible={showAttendanceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAttendanceModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-900">Take Attendance</Text>
              <TouchableOpacity onPress={() => setShowAttendanceModal(false)}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {selectedClass && (
              <>
                <View className="bg-blue-50 rounded-lg p-4 mb-4">
                  <Text className="text-lg font-semibold text-blue-900">{selectedClass.subject}</Text>
                  <Text className="text-blue-700">{selectedClass.semester} Semester • Section {selectedClass.section}</Text>
                  <Text className="text-blue-700">{selectedClass.roomNumber} • {selectedClass.time}</Text>
                </View>
                
                <View className="flex-row justify-between mb-4">
                  <TouchableOpacity 
                    className="flex-1 bg-green-600 py-3 px-4 rounded-lg mr-2"
                    onPress={() => {
                      // Handle QR code attendance - navigate to main attendance page
                      setShowAttendanceModal(false);
                      router.push("/attendance");
                    }}
                  >
                    <Text className="text-white font-medium text-center">QR Code</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-1 bg-blue-600 py-3 px-4 rounded-lg ml-2"
                    onPress={() => {
                      // Handle manual attendance - navigate to main attendance page
                      setShowAttendanceModal(false);
                      router.push("/attendance");
                    }}
                  >
                    <Text className="text-white font-medium text-center">Manual</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
