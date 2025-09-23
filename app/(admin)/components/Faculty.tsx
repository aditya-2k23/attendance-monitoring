import React from "react";
import { Text, View } from "react-native";
import { FacultyPerformance } from "../types";

interface Props {
  facultyPerformance: FacultyPerformance[];
}

export default function Faculty({ facultyPerformance }: Props) {
  return (
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
}
