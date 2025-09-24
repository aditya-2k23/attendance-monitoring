import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { AttendanceStats } from "../types";

interface Props {
  attendanceStats: AttendanceStats[];
  onExport: (label: string) => void;
}

export default function Reports({ attendanceStats, onExport }: Props) {
  return (
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
            onPress={() => onExport("Monthly Attendance CSV")}
          >
            <Text className="text-white font-semibold text-center">
              Export Monthly Attendance (CSV)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-600 p-3 rounded-lg"
            onPress={() => onExport("Semester Report PDF")}
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
}
