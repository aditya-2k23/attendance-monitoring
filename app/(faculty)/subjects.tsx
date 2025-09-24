import { useRouter } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View
} from "react-native";
import { Subject } from "../../types/teacher";

export default function SubjectsTab() {
  const router = useRouter();

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
          <Text className="text-xl font-semibold text-gray-900 mb-4">My Subjects</Text>
          {subjects.map((subject) => (
            <View key={subject.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">{subject.name}</Text>
                  <Text className="text-sm text-gray-600">{subject.code} • {subject.department}</Text>
                  <Text className="text-sm text-gray-600">{subject.semester} Semester • {subject.credits} Credits</Text>
                </View>
                <View className="items-end">
                  <Text className={`text-lg font-bold ${subject.averageAttendance >= 85 ? 'text-green-600' : subject.averageAttendance >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {subject.averageAttendance}%
                  </Text>
                  <Text className="text-xs text-gray-500">Avg Attendance</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
