import React from "react";
import { Text, View } from "react-native";
import { AttendanceStats, FacultyPerformance } from "../types";

interface Props {
  attendanceStats: AttendanceStats[];
  totalStudents: number;
  totalAtRisk: number;
  overallAttendanceRate: number;
  facultyPerformance: FacultyPerformance[];
}

export default function Overview({
  attendanceStats,
  totalStudents,
  totalAtRisk,
  overallAttendanceRate,
  facultyPerformance,
}: Props) {
  return (
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
}
