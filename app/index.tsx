import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import { useAuth } from "./contexts/AuthContext";

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
  if (isAuthenticated && user) {
    // Route to appropriate interface based on user role
    if (user.role === "student") {
      return <Redirect href="/(student-tabs)/" />;
    } else if (user.role === "admin") {
      return <Redirect href="/admin-dashboard" />;
    } else {
      // Teachers, admins, and other roles go to regular tabs
      return <Redirect href="/(tabs)" />;
    }
  } else {
    return <Redirect href="/auth/login" />;
  }
}
