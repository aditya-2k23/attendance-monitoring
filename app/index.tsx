import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      >
        {/* Greeting Header */}
        <View className="flex-row justify-between items-center mt-5 mb-8">
          <View className="flex-1">
            <Text className="text-2xl font-semibold text-gray-900 mb-1">
              Hello Teacher
            </Text>
            <Text className="text-sm text-gray-600">
              You&apos;ve got{" "}
              <Text className="text-blue-500 font-semibold">4 lectures</Text>{" "}
              today!
            </Text>
          </View>
          <View className="relative">
            <View className="w-12 h-12 rounded-full bg-gray-300 justify-center items-center">
              <Text className="text-lg font-semibold text-gray-600">D</Text>
            </View>
            <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 justify-center items-center">
              <Text className="text-xs text-white font-semibold">2</Text>
            </View>
          </View>
        </View>

        {/* Statistics Cards */}
        <View className="flex-row justify-between mb-8">
          <View className="flex-1 bg-white rounded-xl p-5 mx-1.5 items-center shadow-md">
            <Text className="text-3xl font-bold text-gray-900 mb-1">6</Text>
            <Text className="text-sm text-gray-600 text-center">
              Today&apos;s Classes
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-5 mx-1.5 items-center shadow-md">
            <Text className="text-3xl font-bold text-gray-900 mb-1">156</Text>
            <Text className="text-sm text-gray-600 text-center">
              Students Present
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-gray-900 mb-1">
            Quick Actions
          </Text>
          <Text className="text-sm text-gray-600 mb-5">
            Your running subjects
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="w-[48%] h-20 bg-pink-400 rounded-xl justify-center items-center mb-3 shadow-md">
              <Text className="text-white text-sm font-semibold text-center">
                Today&apos;s Classes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[48%] h-20 bg-pink-600 rounded-xl justify-center items-center mb-3 shadow-md"
              onPress={() => router.push("/attendance")}
            >
              <Text className="text-white text-sm font-semibold text-center">
                Lecture Attendance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-[48%] h-20 bg-indigo-600 rounded-xl justify-center items-center mb-3 shadow-md">
              <Text className="text-white text-sm font-semibold text-center">
                Track Attendance
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Schedule */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-gray-900 mb-1">
            Your schedule
          </Text>
          <Text className="text-sm text-gray-600 mb-5">
            Upcoming classes and tasks
          </Text>

          <View className="bg-white rounded-xl p-5 shadow-md">
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-1">
                Physics
              </Text>
              <Text className="text-sm text-gray-600">Chapter: 4 - Force</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <View className="items-start">
                <Text className="text-base font-semibold text-gray-900">
                  09:30
                </Text>
                <Text className="text-xs text-gray-600">Max. three</Text>
              </View>
              <Text className="text-sm text-gray-600">Hall room name</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white flex-row justify-around py-3 pb-5 border-t border-gray-200">
        <TouchableOpacity className="items-center flex-1">
          <View className="w-6 h-6 bg-blue-500 rounded-xl mb-1" />
          <Text className="text-xs text-blue-500 font-semibold">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center flex-1">
          <View className="w-6 h-6 bg-gray-300 rounded-xl mb-1" />
          <Text className="text-xs text-gray-600">Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center flex-1">
          <View className="w-6 h-6 bg-gray-300 rounded-xl mb-1" />
          <Text className="text-xs text-gray-600">Classroom</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center flex-1">
          <View className="w-6 h-6 bg-gray-300 rounded-xl mb-1" />
          <Text className="text-xs text-gray-600">Messages</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
