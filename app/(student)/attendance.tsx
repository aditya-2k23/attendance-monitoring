import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mockData = {
  overview: {
    overall: {
      percentage: 87,
      presentDays: 174,
      totalDays: 200,
    },
    thisMonth: {
      percentage: 92,
      presentDays: 23,
      totalDays: 25,
    },
    thisWeek: {
      percentage: 80,
      presentDays: 4,
      totalDays: 5,
    },
  },
  subjects: [
    {
      name: "Mathematics",
      percentage: 90,
      presentClasses: 36,
      totalClasses: 40,
      requiredAttendance: 75,
      status: "Good",
    },
    {
      name: "Physics",
      percentage: 85,
      presentClasses: 34,
      totalClasses: 40,
      requiredAttendance: 75,
      status: "Good",
    },
    {
      name: "Chemistry",
      percentage: 82,
      presentClasses: 33,
      totalClasses: 40,
      requiredAttendance: 75,
      status: "Good",
    },
    {
      name: "English",
      percentage: 88,
      presentClasses: 35,
      totalClasses: 40,
      requiredAttendance: 75,
      status: "Good",
    },
    {
      name: "Biology",
      percentage: 95,
      presentClasses: 38,
      totalClasses: 40,
      requiredAttendance: 75,
      status: "Good",
    },
  ],
  subjectLectures: {
    Mathematics: [
      {
        id: 1,
        date: "Mon, 22 Sep, 2025",
        time: "[L] - 11:00-12:00 AM",
        faculty: "Faculty: Kumar Saurabh (UID: 32345)",
        status: "present",
      },
      {
        id: 2,
        date: "Mon, 22 Sep, 2025",
        time: "[L] - 12:00-01:00 PM",
        faculty: "Faculty: Kumar Saurabh (UID: 32345)",
        status: "present",
      },
      {
        id: 3,
        date: "Sat, 20 Sep, 2025",
        time: "[L] - 11:00-12:00 AM",
        faculty: "Faculty: Kumar Saurabh (UID: 32345)",
        status: "present",
      },
      {
        id: 4,
        date: "Sat, 20 Sep, 2025",
        time: "[L] - 12:00-01:00 PM",
        faculty: "Faculty: Kumar Saurabh (UID: 32345)",
        status: "present",
      },
      {
        id: 5,
        date: "Fri, 19 Sep, 2025",
        time: "[L] - 11:00-12:00 AM",
        faculty: "Faculty: Kumar Saurabh (UID: 32345)",
        status: "present",
      },
    ],
    Physics: [
      {
        id: 1,
        date: "Tue, 23 Sep, 2025",
        time: "[L] - 09:00-10:00 AM",
        faculty: "Faculty: Dr. Sharma (UID: 12345)",
        status: "present",
      },
      {
        id: 2,
        date: "Mon, 22 Sep, 2025",
        time: "[L] - 09:00-10:00 AM",
        faculty: "Faculty: Dr. Sharma (UID: 12345)",
        status: "absent",
      },
      {
        id: 3,
        date: "Fri, 19 Sep, 2025",
        time: "[L] - 09:00-10:00 AM",
        faculty: "Faculty: Dr. Sharma (UID: 12345)",
        status: "present",
      },
    ],
    Chemistry: [
      {
        id: 1,
        date: "Wed, 17 Sep, 2025",
        time: "[L] - 02:00-03:00 PM",
        faculty: "Faculty: Dr. Patel (UID: 54321)",
        status: "present",
      },
      {
        id: 2,
        date: "Mon, 15 Sep, 2025",
        time: "[L] - 02:00-03:00 PM",
        faculty: "Faculty: Dr. Patel (UID: 54321)",
        status: "present",
      },
    ],
    English: [
      {
        id: 1,
        date: "Thu, 18 Sep, 2025",
        time: "[L] - 10:00-11:00 AM",
        faculty: "Faculty: Ms. Johnson (UID: 67890)",
        status: "present",
      },
    ],
    Biology: [
      {
        id: 1,
        date: "Fri, 19 Sep, 2025",
        time: "[L] - 03:00-04:00 PM",
        faculty: "Faculty: Dr. Singh (UID: 98765)",
        status: "present",
      },
    ],
  },
};

export default function StudentAttendance() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          {selectedSubject && (
            <TouchableOpacity
              onPress={() => setSelectedSubject(null)}
              className="mr-3"
            >
              <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text className="text-xl font-semibold text-gray-900">
              {selectedSubject ? selectedSubject : "My Attendance"}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {selectedSubject
                ? "Lecture attendance history"
                : "Track your attendance record"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1">
        {selectedSubject ? (
          /* Subject Detail View */
          <View className="bg-white">
            {(mockData.subjectLectures as any)[selectedSubject]?.map(
              (lecture: any, index: number) => (
                <View
                  key={lecture.id}
                  className="flex-row items-center px-5 py-4 border-b border-gray-100"
                >
                  {/* Status Indicator */}
                  <View className="mr-4">
                    <View
                      className={`w-8 h-8 rounded-md items-center justify-center ${
                        lecture.status === "present"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      <Text className="text-white font-bold text-lg">P</Text>
                    </View>
                    <View className="w-1 h-4 bg-green-500 ml-3.5 mt-1" />
                  </View>

                  {/* Lecture Details */}
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900 mb-1">
                      {lecture.date}{" "}
                      <Text className="text-gray-500 font-normal">
                        {lecture.time}
                      </Text>
                    </Text>
                    <Text className="text-sm text-orange-500">
                      {lecture.faculty}
                    </Text>
                  </View>
                </View>
              )
            )}
          </View>
        ) : (
          /* Main Overview */
          <>
            {/* Overview Section */}
            <View className="bg-white px-5 py-4">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Overview
              </Text>

              {/* Overall Stats */}
              <View className="flex-row justify-between items-center mb-6 p-4 bg-blue-50 rounded-lg">
                <View>
                  <Text className="text-sm text-gray-600">
                    Overall Attendance
                  </Text>
                  <Text className="text-2xl font-bold text-blue-600 mt-1">
                    {mockData.overview.overall.percentage}%
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {mockData.overview.overall.presentDays} /{" "}
                    {mockData.overview.overall.totalDays} days
                  </Text>
                </View>
                <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center">
                  <Text className="text-sm font-bold text-blue-600">
                    {mockData.overview.overall.percentage}%
                  </Text>
                </View>
              </View>

              {/* This Month Stats */}
              <View className="flex-row justify-between mb-6">
                <View className="flex-1 mr-2">
                  <View
                    className={`p-4 rounded-lg border ${getAttendanceBgColor(mockData.overview.thisMonth.percentage)}`}
                  >
                    <Text className="text-sm text-gray-600">This Month</Text>
                    <Text
                      className={`text-xl font-bold mt-1 ${getAttendanceColor(mockData.overview.thisMonth.percentage)}`}
                    >
                      {mockData.overview.thisMonth.percentage}%
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {mockData.overview.thisMonth.presentDays} /{" "}
                      {mockData.overview.thisMonth.totalDays} days
                    </Text>
                  </View>
                </View>
                <View className="flex-1 ml-2">
                  <View
                    className={`p-4 rounded-lg border ${getAttendanceBgColor(mockData.overview.thisWeek.percentage)}`}
                  >
                    <Text className="text-sm text-gray-600">This Week</Text>
                    <Text
                      className={`text-xl font-bold mt-1 ${getAttendanceColor(mockData.overview.thisWeek.percentage)}`}
                    >
                      {mockData.overview.thisWeek.percentage}%
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {mockData.overview.thisWeek.presentDays} /{" "}
                      {mockData.overview.thisWeek.totalDays} days
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* By Subject Section */}
            <View className="bg-white px-5 py-4 border-t border-gray-200">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                By Subject
              </Text>

              {mockData.subjects.map((subject, index) => (
                <TouchableOpacity
                  key={index}
                  className="mb-4 p-4 bg-gray-50 rounded-lg"
                  onPress={() => setSelectedSubject(subject.name)}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-base font-medium text-gray-900">
                      {subject.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Text
                        className={`text-lg font-bold ${getAttendanceColor(subject.percentage)} mr-2`}
                      >
                        {subject.percentage}%
                      </Text>
                      <MaterialIcons
                        name="chevron-right"
                        size={20}
                        color="#9CA3AF"
                      />
                    </View>
                  </View>
                  <View className="flex-row justify-between text-sm text-gray-600">
                    <Text>Present: {subject.presentClasses}</Text>
                    <Text>Total: {subject.totalClasses}</Text>
                  </View>
                  <View className="flex-row justify-between text-xs text-gray-500 mt-1">
                    <Text>Required: {subject.requiredAttendance}%</Text>
                    <Text
                      className={
                        subject.status === "Good"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {subject.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
