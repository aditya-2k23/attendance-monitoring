import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mock student attendance data
const attendanceData = {
  overall: {
    totalClasses: 120,
    attendedClasses: 102,
    percentage: 85,
    target: 75, // Minimum required percentage
  },
  subjects: [
    {
      id: 1,
      name: "Physics",
      totalClasses: 24,
      attendedClasses: 22,
      percentage: 92,
      instructor: "Dr. Smith",
      lastAttended: "2025-09-22",
    },
    {
      id: 2,
      name: "Mathematics",
      totalClasses: 26,
      attendedClasses: 20,
      percentage: 77,
      instructor: "Prof. Johnson",
      lastAttended: "2025-09-21",
    },
    {
      id: 3,
      name: "Chemistry",
      totalClasses: 22,
      attendedClasses: 19,
      percentage: 86,
      instructor: "Dr. Brown",
      lastAttended: "2025-09-22",
    },
    {
      id: 4,
      name: "Biology",
      totalClasses: 24,
      attendedClasses: 21,
      percentage: 88,
      instructor: "Prof. Wilson",
      lastAttended: "2025-09-20",
    },
    {
      id: 5,
      name: "Computer Science",
      totalClasses: 24,
      attendedClasses: 20,
      percentage: 83,
      instructor: "Dr. Davis",
      lastAttended: "2025-09-22",
    },
  ],
  recentClasses: [
    {
      id: 1,
      subject: "Physics",
      date: "2025-09-22",
      time: "09:30 - 10:30",
      status: "present",
      topic: "Force and Motion",
    },
    {
      id: 2,
      subject: "Chemistry",
      date: "2025-09-22",
      time: "01:30 - 02:30",
      status: "present",
      topic: "Organic Chemistry",
    },
    {
      id: 3,
      subject: "Mathematics",
      date: "2025-09-21",
      time: "11:00 - 12:00",
      status: "present",
      topic: "Calculus - Derivatives",
    },
    {
      id: 4,
      subject: "Computer Science",
      date: "2025-09-21",
      time: "02:00 - 03:00",
      status: "absent",
      topic: "Data Structures",
    },
    {
      id: 5,
      subject: "Biology",
      date: "2025-09-20",
      time: "10:00 - 11:00",
      status: "present",
      topic: "Cell Structure",
    },
  ],
};

export default function StudentAttendance() {
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "subjects" | "history"
  >("overview");

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return "text-green-500";
    if (percentage >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  const getAttendanceBgColor = (percentage: number) => {
    if (percentage >= 85) return "bg-green-100";
    if (percentage >= 75) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getStatusColor = (status: string) => {
    return status === "present" ? "bg-green-500" : "bg-red-500";
  };

  const getStatusIcon = (status: string) => {
    return status === "present" ? "check-circle" : "cancel";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <Text className="text-xl font-semibold text-gray-900">
          My Attendance
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Track your attendance record
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white px-5 py-3 border-b border-gray-200">
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            className={`flex-1 py-2 px-4 rounded-md ${
              selectedTab === "overview" ? "bg-white shadow-sm" : ""
            }`}
            onPress={() => setSelectedTab("overview")}
          >
            <Text
              className={`text-center text-sm font-medium ${
                selectedTab === "overview" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 px-4 rounded-md ${
              selectedTab === "subjects" ? "bg-white shadow-sm" : ""
            }`}
            onPress={() => setSelectedTab("subjects")}
          >
            <Text
              className={`text-center text-sm font-medium ${
                selectedTab === "subjects" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              By Subject
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 px-4 rounded-md ${
              selectedTab === "history" ? "bg-white shadow-sm" : ""
            }`}
            onPress={() => setSelectedTab("history")}
          >
            <Text
              className={`text-center text-sm font-medium ${
                selectedTab === "history" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
      >
        {selectedTab === "overview" && (
          <>
            {/* Overall Statistics */}
            <View className="bg-white rounded-xl p-5 mb-6 shadow-md">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Overall Attendance
              </Text>

              <View className="items-center mb-4">
                <View
                  className={`w-32 h-32 rounded-full items-center justify-center ${getAttendanceBgColor(attendanceData.overall.percentage)}`}
                >
                  <Text
                    className={`text-3xl font-bold ${getAttendanceColor(attendanceData.overall.percentage)}`}
                  >
                    {attendanceData.overall.percentage}%
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">Attendance</Text>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold text-blue-500">
                    {attendanceData.overall.attendedClasses}
                  </Text>
                  <Text className="text-xs text-gray-600 text-center">
                    Classes Attended
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold text-blue-500">
                    {attendanceData.overall.totalClasses}
                  </Text>
                  <Text className="text-xs text-gray-600 text-center">
                    Total Classes
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold text-blue-500">
                    {attendanceData.overall.target}%
                  </Text>
                  <Text className="text-xs text-gray-600 text-center">
                    Required Min.
                  </Text>
                </View>
              </View>

              {attendanceData.overall.percentage <
                attendanceData.overall.target && (
                <View className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <Text className="text-sm text-red-600 font-medium">
                    ⚠️ Warning: Your attendance is below the required minimum of{" "}
                    {attendanceData.overall.target}%
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Stats */}
            <View className="flex-row justify-between mb-6">
              <View className="flex-1 bg-white rounded-xl p-4 mx-1 items-center shadow-md">
                <MaterialIcons name="today" size={24} color="#3b82f6" />
                <Text className="text-lg font-bold text-gray-900 mt-2">5</Text>
                <Text className="text-xs text-gray-600 text-center">
                  Classes This Week
                </Text>
              </View>
              <View className="flex-1 bg-white rounded-xl p-4 mx-1 items-center shadow-md">
                <MaterialIcons name="trending-up" size={24} color="#10b981" />
                <Text className="text-lg font-bold text-gray-900 mt-2">
                  +2%
                </Text>
                <Text className="text-xs text-gray-600 text-center">
                  This Month
                </Text>
              </View>
              <View className="flex-1 bg-white rounded-xl p-4 mx-1 items-center shadow-md">
                <MaterialIcons
                  name="calendar-month"
                  size={24}
                  color="#f59e0b"
                />
                <Text className="text-lg font-bold text-gray-900 mt-2">18</Text>
                <Text className="text-xs text-gray-600 text-center">
                  Days Left
                </Text>
              </View>
            </View>
          </>
        )}

        {selectedTab === "subjects" && (
          <View className="space-y-4">
            {attendanceData.subjects.map((subject) => (
              <View
                key={subject.id}
                className="bg-white rounded-xl p-4 shadow-md"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {subject.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {subject.instructor}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${getAttendanceBgColor(subject.percentage)}`}
                  >
                    <Text
                      className={`text-sm font-semibold ${getAttendanceColor(subject.percentage)}`}
                    >
                      {subject.percentage}%
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">
                    {subject.attendedClasses}/{subject.totalClasses} classes
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Last attended: {formatDate(subject.lastAttended)}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View className="mt-3">
                  <View className="w-full h-2 bg-gray-200 rounded-full">
                    <View
                      className={`h-2 rounded-full ${
                        subject.percentage >= 85
                          ? "bg-green-500"
                          : subject.percentage >= 75
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedTab === "history" && (
          <View className="space-y-3">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Recent Classes
            </Text>
            {attendanceData.recentClasses.map((class_item) => (
              <View
                key={class_item.id}
                className="bg-white rounded-xl p-4 shadow-md"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {class_item.subject}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {class_item.topic}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {formatDate(class_item.date)} • {class_item.time}
                    </Text>
                  </View>
                  <View className="items-end">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${getStatusColor(class_item.status)}`}
                    >
                      <MaterialIcons
                        name={getStatusIcon(class_item.status)}
                        size={16}
                        color="white"
                      />
                    </View>
                    <Text
                      className={`text-xs font-medium mt-1 ${
                        class_item.status === "present"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {class_item.status === "present" ? "Present" : "Absent"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
