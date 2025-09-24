import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { User } from "../types";

interface Props {
  users: User[];
  onAddUser: () => void;
}

export default function Users({ users, onAddUser }: Props) {
  return (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-gray-900">
          User Management
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-lg"
          onPress={onAddUser}
        >
          <Text className="text-white font-semibold">Add User</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white rounded-xl shadow-md">
        {users.map((user, index) => (
          <View
            key={user.id}
            className={`p-4 ${index < users.length - 1 ? "border-b border-gray-200" : ""}`}
          >
            <View className="flex-row justify-between items-start">
              {/* User Photo */}
              <View className="mr-3">
                {user.photoUri ? (
                  <Image
                    source={{ uri: user.photoUri }}
                    className="w-12 h-12 rounded-full bg-gray-200"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-gray-300 justify-center items-center">
                    <Text className="text-lg font-semibold text-gray-600">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-base font-semibold text-gray-900 mr-2">
                    {user.name}
                  </Text>
                  <View
                    className={`px-2 py-1 rounded-full ${user.role === "teacher" ? "bg-blue-100" : "bg-green-100"}`}
                  >
                    <Text
                      className={`text-xs font-semibold ${user.role === "teacher" ? "text-blue-700" : "text-green-700"}`}
                    >
                      {user.role.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-600 mb-1">{user.email}</Text>
                <Text className="text-sm text-gray-600 mb-1">
                  ID: {user.userId}
                </Text>
                <Text className="text-sm text-gray-600">{user.department}</Text>
                {user.courses && (
                  <Text className="text-xs text-gray-500 mt-1">
                    Courses: {user.courses.join(", ")}
                  </Text>
                )}
              </View>
              <View className="flex-row space-x-2">
                <TouchableOpacity className="bg-gray-100 px-3 py-1 rounded-lg">
                  <Text className="text-xs text-gray-700">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-red-100 px-3 py-1 rounded-lg">
                  <Text className="text-xs text-red-700">Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
