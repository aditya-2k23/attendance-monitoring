import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import { useAuth } from "./contexts/AuthContext";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-600">Loading...</Text>
      </View>
    );
  }

  // Redirect based on authentication state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
}
