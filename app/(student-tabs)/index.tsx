import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import "../globals.css";

// Subject-wise attendance data
const subjectAttendance = [
  { 
    subject: "Physics", 
    attended: 18, 
    total: 20, 
    percentage: 90,
    color: "#3b82f6", // blue
    instructor: "Dr. Smith"
  },
  { 
    subject: "Mathematics", 
    attended: 16, 
    total: 20, 
    percentage: 80,
    color: "#10b981", // green
    instructor: "Prof. Johnson"
  },
  { 
    subject: "Chemistry", 
    attended: 17, 
    total: 20, 
    percentage: 85,
    color: "#f59e0b", // yellow
    instructor: "Dr. Brown"
  },
  { 
    subject: "Computer Science", 
    attended: 19, 
    total: 20, 
    percentage: 95,
    color: "#8b5cf6", // purple
    instructor: "Dr. Davis"
  },
  { 
    subject: "Biology", 
    attended: 15, 
    total: 18, 
    percentage: 83,
    color: "#06b6d4", // cyan
    instructor: "Prof. Wilson"
  },
];

// Today's timetable
const todaysTimetable = [
  {
    time: "09:00-10:00",
    subject: "Physics",
    chapter: "Chapter 4 - Force",
    instructor: "Dr. Smith",
    room: "Hall room 101",
    type: "Lecture",
    status: "completed"
  },
  {
    time: "10:00-11:00",
    subject: "Mathematics", 
    chapter: "Calculus - Integration",
    instructor: "Prof. Johnson",
    room: "Hall room 205",
    type: "Tutorial",
    status: "current"
  },
  {
    time: "11:00-12:00",
    subject: "Chemistry",
    chapter: "Organic Chemistry Lab",
    instructor: "Dr. Brown", 
    room: "Lab 103",
    type: "Practical",
    status: "upcoming"
  },
  {
    time: "14:00-15:00",
    subject: "Computer Science",
    chapter: "Data Structures",
    instructor: "Dr. Davis",
    room: "Lab 201",
    type: "Practical", 
    status: "upcoming"
  },
];

// Exam schedule
const upcomingExams = [
  {
    subject: "Physics",
    type: "Mid-term Exam", 
    date: "2025-09-28",
    time: "10:00 AM",
    room: "Exam Hall A",
    marks: 100,
    daysLeft: 6
  },
  {
    subject: "Mathematics",
    type: "Quiz",
    date: "2025-09-25", 
    time: "11:00 AM",
    room: "Hall room 205",
    marks: 25,
    daysLeft: 3
  },
  {
    subject: "Chemistry", 
    type: "Lab Test",
    date: "2025-09-30",
    time: "02:00 PM", 
    room: "Lab 103",
    marks: 50,
    daysLeft: 8
  }
];

const studentInfo = {
  name: "Alice Johnson",
  studentId: "STU-2024-001",
  semester: "Fall 2025",
  cgpa: 3.7,
  totalLectures: 98,
  attendedLectures: 87,
  overallAttendance: 89
};

// Circular Progress Component (React Native compatible)
interface CircularProgressProps {
  percentage: number;
  size?: number;
  color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, size = 80, color = "#3b82f6" }) => {
  return (
    <View style={{ width: size, height: size }} className="justify-center items-center">
      {/* Center Text Only */}
      <View className="absolute justify-center items-center">
        <Text className="text-2xl font-bold" style={{ color: '#10b981' }}>
          {percentage}%
        </Text>
        <Text className="text-sm font-medium mt-1" style={{ color: '#6b7280' }}>
          Attendance
        </Text>
      </View>
    </View>
  );
};

export default function StudentDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

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

  const handleProfilePress = () => {
    router.push("/(student-tabs)/profile");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "current":
        return "bg-blue-100 text-blue-700";
      case "upcoming":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return "#10b981"; // green
    if (percentage >= 75) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-xl font-semibold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0] || studentInfo.name.split(' ')[0]}!
            </Text>
            <Text className="text-sm text-gray-600">
              Ready for today's learning journey?
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 rounded-full justify-center items-center bg-blue-500"
            onPress={handleProfilePress}
          >
            <MaterialIcons name="person" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
      >
        {/* Quick Stats */}
        

        {/* Quick Overview */}
        <View className="bg-white rounded-xl p-5 shadow-md mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Student ID</Text>
              <Text className="text-sm font-medium text-gray-900">{studentInfo.studentId}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Major</Text>
              <Text className="text-sm font-medium text-gray-900">Computer Science</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Year</Text>
              <Text className="text-sm font-medium text-gray-900">Junior</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Semester</Text>
              <Text className="text-sm font-medium text-gray-900">{studentInfo.semester}</Text>
            </View>
          </View>
        </View>

        {/* Attendance Overview with Circular Charts */}
        <View className="bg-white rounded-xl p-5 shadow-md mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Overall Attendance
          </Text>
          
          <View className="items-center justify-center py-6">
            <View className="relative">
              {/* Circular Background */}
              <View 
                className="absolute rounded-full"
                style={{
                  width: 140,
                  height: 140,
                  backgroundColor: studentInfo.overallAttendance >= 85 ? '#dcfce7' : 
                                  studentInfo.overallAttendance >= 75 ? '#fef3c7' : '#fee2e2',
                  top: -10,
                  left: -10,
                }}
              />
              <CircularProgress 
                percentage={studentInfo.overallAttendance}
                color={getAttendanceColor(studentInfo.overallAttendance)}
                size={120}
              />
            </View>
            <Text className="text-base font-medium text-gray-900 mt-4 text-center">
              Overall Attendance
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              {studentInfo.attendedLectures}/{studentInfo.totalLectures} total classes
            </Text>
          </View>
          
          <TouchableOpacity 
            className="bg-blue-50 rounded-lg p-3 mt-2"
            onPress={() => router.push("/(student-tabs)/attendance")}
          >
            <Text className="text-blue-600 text-center font-medium">
              View Detailed Attendance
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Timetable */}
        <TouchableOpacity 
          className="bg-white rounded-xl p-5 shadow-md mb-6"
          onPress={() => router.push("/(student-tabs)/timetable")}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Today's Timetable
            </Text>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </View>
          
          <View className="space-y-3">
            {todaysTimetable.map((class_item, index) => (
              <View key={index} className="border border-gray-200 rounded-lg p-3">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {class_item.subject}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {class_item.chapter}
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded-lg ${getStatusColor(class_item.status)}`}>
                    <Text className="text-xs font-medium capitalize">
                      {class_item.status}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-sm font-medium text-gray-900">
                      {class_item.time}
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {class_item.instructor}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600">
                    {class_item.room}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}