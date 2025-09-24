import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function FacultyLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, focused, size }) => (
            <MaterialIcons
              name={focused ? "task-alt" : "task"}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="classroom"
        options={{
          title: "Classroom",
          tabBarIcon: ({ color, focused, size }) => (
            <FontAwesome5
              name={focused ? "chalkboard-teacher" : "chalkboard"}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
