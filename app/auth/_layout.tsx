import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back on login screen
        }}
      />
    </Stack>
  );
}
