import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

// Subject-wise attendance data
const subjectAttendance = [
  {
    subject: "Physics",
    attended: 18,
    total: 20,
    percentage: 90,
    color: "#3b82f6", // blue
    instructor: "Dr. Smith",
  },
  {
    subject: "Mathematics",
    attended: 16,
    total: 20,
    percentage: 80,
    color: "#10b981", // green
    instructor: "Prof. Johnson",
  },
  {
    subject: "Chemistry",
    attended: 17,
    total: 20,
    percentage: 85,
    color: "#f59e0b", // yellow
    instructor: "Dr. Brown",
  },
  {
    subject: "Computer Science",
    attended: 19,
    total: 20,
    percentage: 95,
    color: "#8b5cf6", // purple
    instructor: "Dr. Davis",
  },
  {
    subject: "Biology",
    attended: 15,
    total: 18,
    percentage: 83,
    color: "#06b6d4", // cyan
    instructor: "Prof. Wilson",
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
    status: "completed",
  },
  {
    time: "10:00-11:00",
    subject: "Mathematics",
    chapter: "Calculus - Integration",
    instructor: "Prof. Johnson",
    room: "Hall room 205",
    type: "Tutorial",
    status: "current",
  },
  {
    time: "11:00-12:00",
    subject: "Chemistry",
    chapter: "Organic Chemistry Lab",
    instructor: "Dr. Brown",
    room: "Lab 103",
    type: "Practical",
    status: "upcoming",
  },
  {
    time: "14:00-15:00",
    subject: "Computer Science",
    chapter: "Data Structures",
    instructor: "Dr. Davis",
    room: "Lab 201",
    type: "Practical",
    status: "upcoming",
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
    daysLeft: 6,
  },
  {
    subject: "Mathematics",
    type: "Quiz",
    date: "2025-09-25",
    time: "11:00 AM",
    room: "Hall room 205",
    marks: 25,
    daysLeft: 3,
  },
  {
    subject: "Chemistry",
    type: "Lab Test",
    date: "2025-09-30",
    time: "02:00 PM",
    room: "Lab 103",
    marks: 50,
    daysLeft: 8,
  },
];

const studentInfo = {
  name: "Alice Johnson",
  studentId: "STU-2024-001",
  semester: "Fall 2025",
  cgpa: 3.7,
  totalLectures: 98,
  attendedLectures: 87,
  overallAttendance: 89,
};

// Circular Progress Component (React Native compatible)
interface CircularProgressProps {
  percentage: number;
  size?: number;
  color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 80,
  color = "#3b82f6",
}) => {
  const strokeWidth = 6;

  // Create smooth progress using many small arcs
  const createProgressArc = () => {
    const totalDegrees = (percentage / 100) * 360;
    const segments = [];
    const segmentCount = Math.max(20, Math.floor(totalDegrees / 5)); // At least 20 segments

    for (
      let i = 0;
      i < segmentCount && i * (360 / segmentCount) < totalDegrees;
      i++
    ) {
      const rotation = (360 / segmentCount) * i - 90; // Start from top

      segments.push(
        <View
          key={i}
          className="absolute"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: "transparent",
            borderTopColor: color,
            transform: [{ rotate: `${rotation}deg` }],
          }}
        />
      );
    }
    return segments;
  };

  return (
    <View
      style={{ width: size, height: size }}
      className="justify-center items-center"
    >
      {/* Background Circle */}
      <View
        className="absolute"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: "#e5e7eb",
        }}
      />

      {/* Progress Arc */}
      {createProgressArc()}

      {/* Center Text */}
      <View className="absolute justify-center items-center">
        <Text className="text-base font-bold" style={{ color: "#374151" }}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
};

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const handleProfilePress = () => {
    router.push("/(student)/profile");
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
              Welcome back,{" "}
              {user?.name?.split(" ")[0] || studentInfo.name.split(" ")[0]}!
            </Text>
            <Text className="text-sm text-gray-600">
              Ready for today&apos;s learning journey?
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
        <View className="flex-row justify-between mb-6">
          <View className="flex-1 bg-white rounded-xl p-4 mx-1 items-center shadow-md">
            <Text className="text-2xl font-bold text-green-500">
              {studentInfo.overallAttendance}%
            </Text>
            <Text className="text-xs text-gray-600 text-center">
              Attendance
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 mx-1 items-center shadow-md">
            <Text className="text-2xl font-bold text-orange-500">
              {upcomingExams.length}
            </Text>
            <Text className="text-xs text-gray-600 text-center">
              Pending Tasks
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 mx-1 items-center shadow-md">
            <Text className="text-2xl font-bold text-blue-500">
              {studentInfo.cgpa}
            </Text>
            <Text className="text-xs text-gray-600 text-center">
              Current GPA
            </Text>
          </View>
        </View>

        {/* Quick Overview */}
        <View className="bg-white rounded-xl p-5 shadow-md mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Quick Overview
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Student ID</Text>
              <Text className="text-sm font-medium text-gray-900">
                {studentInfo.studentId}
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
              <Text className="text-sm font-medium text-gray-900">Junior</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Semester</Text>
              <Text className="text-sm font-medium text-gray-900">
                {studentInfo.semester}
              </Text>
            </View>
          </View>
        </View>

        {/* Attendance Overview with Circular Charts */}
        <View className="bg-white rounded-xl p-5 shadow-md mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Subject-wise Attendance
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {subjectAttendance.slice(0, 4).map((subject, index) => (
              <View key={index} className="w-[48%] items-center mb-4">
                <CircularProgress
                  percentage={subject.percentage}
                  color={getAttendanceColor(subject.percentage)}
                  size={70}
                />
                <Text className="text-sm font-medium text-gray-900 mt-2 text-center">
                  {subject.subject}
                </Text>
                <Text className="text-xs text-gray-600 text-center">
                  {subject.attended}/{subject.total} classes
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity className="bg-blue-50 rounded-lg p-3 mt-2">
            <Text className="text-blue-600 text-center font-medium">
              View Detailed Attendance
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Timetable */}
        <View className="bg-white rounded-xl p-5 shadow-md mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Today’s Timetable
          </Text>

          <View className="space-y-3">
            {todaysTimetable.map((class_item, index) => (
              <View
                key={index}
                className="border border-gray-200 rounded-lg p-3"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {class_item.subject}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {class_item.chapter}
                    </Text>
                  </View>
                  <View
                    className={`px-2 py-1 rounded-lg ${getStatusColor(class_item.status)}`}
                  >
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
        </View>

        {/* Exams Section */}
        <View className="bg-white rounded-xl p-5 shadow-md mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Exams
          </Text>

          <View className="space-y-3">
            {upcomingExams.map((exam, index) => (
              <View
                key={index}
                className="border-l-4 border-red-400 bg-red-50 rounded-lg p-3"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {exam.subject}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {exam.type} • {exam.marks} marks
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {exam.time} • {exam.room}
                    </Text>
                  </View>
                  <View className="items-end">
                    <View className="bg-red-100 px-2 py-1 rounded-lg">
                      <Text className="text-red-700 text-xs font-medium">
                        {exam.daysLeft} days left
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Overall Statistics */}
        <View className="bg-white rounded-xl p-5 shadow-md mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Academic Statistics
          </Text>

          <View className="space-y-4">
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Total Lectures</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {studentInfo.attendedLectures}/{studentInfo.totalLectures}
                </Text>
              </View>
              <View className="w-full h-2 bg-gray-200 rounded-full">
                <View
                  className="h-2 bg-blue-500 rounded-full"
                  style={{
                    width: `${(studentInfo.attendedLectures / studentInfo.totalLectures) * 100}%`,
                  }}
                />
              </View>
            </View>

            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">
                  Overall Attendance
                </Text>
                <Text className="text-sm font-medium text-gray-900">
                  {studentInfo.overallAttendance}%
                </Text>
              </View>
              <View className="w-full h-2 bg-gray-200 rounded-full">
                <View
                  className={`h-2 rounded-full ${
                    studentInfo.overallAttendance >= 85
                      ? "bg-green-500"
                      : studentInfo.overallAttendance >= 75
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${studentInfo.overallAttendance}%` }}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
