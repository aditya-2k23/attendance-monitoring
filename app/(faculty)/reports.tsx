import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Subject, TeacherStats } from "../../types/teacher";

export default function ReportsTab() {
  const [teacherStats] = useState<TeacherStats>({
    totalClasses: 12,
    classesToday: 4,
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

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-900 mb-4">Analytics & Reports</Text>
          
          {/* Overall Stats */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Overall Performance</Text>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600">Classes Completed</Text>
              <Text className="font-semibold text-gray-900">{teacherStats.completedClasses}/{teacherStats.totalClasses}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600">Average Attendance</Text>
              <Text className="font-semibold text-green-600">{teacherStats.averageAttendance}%</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-600">Total Students</Text>
              <Text className="font-semibold text-gray-900">{teacherStats.totalStudents}</Text>
            </View>
          </View>
          
          {/* Subject-wise Performance */}
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Subject Performance</Text>
            {subjects.map((subject) => (
              <View key={subject.id} className="flex-row justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <View>
                  <Text className="font-medium text-gray-900">{subject.name}</Text>
                  <Text className="text-sm text-gray-600">{subject.completedLectures} lectures</Text>
                </View>
                <Text className={`font-bold ${subject.averageAttendance >= 85 ? 'text-green-600' : subject.averageAttendance >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {subject.averageAttendance}%
                </Text>
              </View>
            ))}
          </View>
          
          {/* Action Buttons */}
          <View className="flex-row justify-between">
            <TouchableOpacity className="flex-1 bg-blue-600 py-3 px-4 rounded-lg mr-2">
              <Text className="text-white font-medium text-center">Detailed Report</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-green-600 py-3 px-4 rounded-lg ml-2">
              <Text className="text-white font-medium text-center">Export Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
