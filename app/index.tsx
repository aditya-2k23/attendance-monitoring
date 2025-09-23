import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-600">Loading...</Text>
      </View>
    );
  }

  // Redirect based on authentication state and user role
  if (!isAuthenticated || !user) {
    return <Redirect href="/auth/login" />;
  }

  if (user.role === "student") {
    return <Redirect href="/(student)" />;
  }

  if (user.role === "admin") {
    // Land admins directly on the Admin tab inside the teacher/admin tabs group
    return <Redirect href="/(admin)/dashboard" />;
  }

  // Teachers (and other non-student, non-admin roles) go to the default tabs
  return <Redirect href="/(faculty)" />;
}
