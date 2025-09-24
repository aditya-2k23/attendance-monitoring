import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TasksTab() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <Text className="text-xl font-semibold text-gray-900">Tasks</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Manage your daily tasks
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
      >
        {/* Coming Soon Card */}
        <View className="bg-white rounded-xl p-8 shadow-md items-center">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Text className="text-2xl">📝</Text>
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            Tasks Coming Soon
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            We&apos;re working on bringing you a comprehensive task management
            system.
          </Text>
          <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg">
            <Text className="text-white font-semibold">Get Notified</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
