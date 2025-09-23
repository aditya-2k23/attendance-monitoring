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
import "../globals.css";

// Complete weekly timetable data
const weeklyTimetable = {
  Monday: [
    { time: "09:00-10:00", subject: "Physics", instructor: "Dr. Smith", room: "LH-01", type: "Lecture", color: "bg-blue-500" },
    { time: "11:00-12:00", subject: "Mathematics", instructor: "Prof. Johnson", room: "LH-05", type: "Lecture", color: "bg-green-500" },
    { time: "14:00-15:00", subject: "Computer Lab", instructor: "Dr. Davis", room: "Lab-3", type: "Practical", color: "bg-purple-500" },
  ],
  Tuesday: [
    { time: "10:00-11:00", subject: "Chemistry", instructor: "Dr. Brown", room: "LH-02", type: "Lecture", color: "bg-red-500" },
    { time: "15:00-16:00", subject: "Physics Lab", instructor: "Dr. Smith", room: "Lab-1", type: "Practical", color: "bg-blue-500" },
  ],
  Wednesday: [
    { time: "09:00-10:00", subject: "Mathematics", instructor: "Prof. Johnson", room: "LH-05", type: "Tutorial", color: "bg-green-500" },
    { time: "11:00-12:00", subject: "Biology", instructor: "Prof. Wilson", room: "LH-03", type: "Lecture", color: "bg-yellow-500" },
    { time: "14:00-15:00", subject: "Chemistry Lab", instructor: "Dr. Brown", room: "Lab-2", type: "Practical", color: "bg-red-500" },
  ],
  Thursday: [
    { time: "10:00-11:00", subject: "Physics", instructor: "Dr. Smith", room: "LH-01", type: "Lecture", color: "bg-blue-500" },
    { time: "12:00-13:00", subject: "Computer Science", instructor: "Dr. Davis", room: "LH-04", type: "Lecture", color: "bg-purple-500" },
  ],
  Friday: [
    { time: "09:00-10:00", subject: "Biology", instructor: "Prof. Wilson", room: "LH-03", type: "Lecture", color: "bg-yellow-500" },
    { time: "11:00-12:00", subject: "Mathematics", instructor: "Prof. Johnson", room: "LH-05", type: "Lecture", color: "bg-green-500" },
    { time: "14:00-16:00", subject: "Project Work", instructor: "Dr. Davis", room: "Lab-3", type: "Project", color: "bg-indigo-500" },
  ],
  Saturday: [
    { time: "10:00-12:00", subject: "Seminar", instructor: "Various", room: "Auditorium", type: "Seminar", color: "bg-pink-500" },
  ],
};

const timeSlots = [
  "09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00",
  "14:00-15:00", "15:00-16:00", "16:00-17:00"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudentTimetable() {
  const [selectedDay, setSelectedDay] = useState("Monday");

  const getCurrentDayClasses = () => {
    return weeklyTimetable[selectedDay as keyof typeof weeklyTimetable] || [];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Lecture":
        return "school";
      case "Practical":
        return "science";
      case "Tutorial":
        return "help";
      case "Project":
        return "build";
      case "Seminar":
        return "groups";
      default:
        return "event";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <Text className="text-xl font-semibold text-gray-900">My Timetable</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Weekly class schedule
        </Text>
      </View>

      {/* Day Selector */}
      <View className="bg-white px-5 py-3 border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                className={`px-4 py-2 rounded-full ${
                  selectedDay === day ? "bg-blue-500" : "bg-gray-100"
                }`}
                onPress={() => setSelectedDay(day)}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedDay === day ? "text-white" : "text-gray-600"
                  }`}
                >
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
      >
        {/* Day View */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            {selectedDay} Schedule
          </Text>

          <View className="space-y-3">
            {getCurrentDayClasses().map((class_item, index) => (
                <View key={index} className="bg-white rounded-xl p-4 shadow-md">
                  <View className="flex-row items-center mb-3">
                    <View className={`w-10 h-10 rounded-full ${class_item.color} items-center justify-center mr-3`}>
                      <MaterialIcons 
                        name={getTypeIcon(class_item.type)} 
                        size={20} 
                        color="white" 
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {class_item.subject}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {class_item.instructor}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-medium text-gray-900">
                        {class_item.time}
                      </Text>
                      <Text className="text-xs text-gray-600">
                        {class_item.room}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <View className={`px-2 py-1 rounded-lg ${
                      class_item.type === 'Lecture' ? 'bg-blue-100' :
                      class_item.type === 'Practical' ? 'bg-green-100' :
                      class_item.type === 'Tutorial' ? 'bg-purple-100' :
                      class_item.type === 'Project' ? 'bg-indigo-100' : 'bg-pink-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        class_item.type === 'Lecture' ? 'text-blue-700' :
                        class_item.type === 'Practical' ? 'text-green-700' :
                        class_item.type === 'Tutorial' ? 'text-purple-700' :
                        class_item.type === 'Project' ? 'text-indigo-700' : 'text-pink-700'
                      }`}>
                        {class_item.type}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
        </View>

        {/* Weekly Overview Grid */}
        

        {/* Quick Stats */}
        
      </ScrollView>
    </SafeAreaView>
  );
}