import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth, UserRole } from "../../contexts/AuthContext";

export default function LoginScreen() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ userId?: string; password?: string }>(
    {}
  );

  const { login, isLoading } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { userId?: string; password?: string } = {};

    if (!userId.trim()) {
      newErrors.userId = "User ID is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const success = await login(userId.trim(), password, role);

    if (success) {
      // Always redirect to home - the main index will handle role-based routing
      router.replace("/");
    } else {
      Alert.alert(
        "Login Failed",
        "Invalid credentials. Please check your User ID, password, and selected role.",
        [{ text: "OK" }]
      );
    }
  };

  const getRoleIcon = (selectedRole: UserRole) => {
    switch (selectedRole) {
      case "student":
        return <MaterialIcons name="school" size={20} color="#3b82f6" />;
      case "teacher":
        return <MaterialIcons name="person" size={20} color="#10b981" />;
      case "admin":
        return (
          <MaterialIcons
            name="admin-panel-settings"
            size={20}
            color="#f59e0b"
          />
        );
      default:
        return <MaterialIcons name="person" size={20} color="#6b7280" />;
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="school" size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Sign in to your attendance monitoring account
          </Text>
        </View>

        {/* Login Form */}
        <View className="space-y-6">
          {/* Role Selection */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Select Role
            </Text>
            <View className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <View className="flex-row items-center px-4 py-2">
                {getRoleIcon(role)}
                <View className="flex-1 ml-3">
                  <Picker
                    selectedValue={role}
                    onValueChange={(itemValue: UserRole) => setRole(itemValue)}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="Student Login" value="student" />
                    <Picker.Item label="Teacher Login" value="teacher" />
                    <Picker.Item label="Admin Login" value="admin" />
                  </Picker>
                </View>
              </View>
            </View>
          </View>

          {/* User ID Input */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              User ID
            </Text>
            <View
              className={`bg-white border rounded-xl px-4 py-4 flex-row items-center ${
                errors.userId ? "border-red-300" : "border-gray-200"
              }`}
            >
              <MaterialIcons name="person-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="Enter your User ID"
                placeholderTextColor="#9ca3af"
                value={userId}
                onChangeText={(text) => {
                  setUserId(text);
                  if (errors.userId)
                    setErrors((prev) => ({ ...prev, userId: undefined }));
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.userId && (
              <Text className="text-red-500 text-sm mt-1 ml-1">
                {errors.userId}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Password
            </Text>
            <View
              className={`bg-white border rounded-xl px-4 py-4 flex-row items-center ${
                errors.password ? "border-red-300" : "border-gray-200"
              }`}
            >
              <MaterialIcons name="lock-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="ml-2"
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1 ml-1">
                {errors.password}
              </Text>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className={`rounded-xl py-4 items-center mt-8 ${
              isLoading ? "bg-blue-300" : "bg-blue-500"
            }`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text className="text-white font-semibold text-base">
                Signing In...
              </Text>
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Demo Credentials */}
          <View className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <Text className="text-sm font-semibold text-yellow-800 mb-2">
              Demo Credentials:
            </Text>
            <Text className="text-xs text-yellow-700">
              Teacher: teacher123 / password123
            </Text>
            <Text className="text-xs text-yellow-700">
              Student: student456 / password456
            </Text>
            <Text className="text-xs text-yellow-700">
              Admin: admin789 / admin123
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
