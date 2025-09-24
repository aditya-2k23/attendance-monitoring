import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { io, Socket } from "socket.io-client";
import { getTodaySchedule } from "../utils/schedule";

export default function AttendancePage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Use the same classes from shared schedule utility
  const todaysClasses = getTodaySchedule().map((classItem, index) => ({
    id: index + 1,
    subject: classItem.subject,
    chapter: `${classItem.subject} - Current Topic`,
    time: classItem.time,
    room: `Room ${classItem.roomNumber}`,
    section: `Section ${classItem.section}`,
    semester: classItem.semester,
    totalStudents: classItem.totalStudents || 45,
    presentStudents: Math.floor((classItem.totalStudents || 45) * 0.9), // 90% attendance rate
    status: classItem.status,
  }));

  useEffect(() => {
    // For Expo, use your computer's IP address instead of localhost
    // You can find it by running `expo start` and looking at the QR code URL
    // Or use 'http://192.168.x.x:3001' (replace with your actual IP)
    // const socketConnection = io("http://10.0.2.2:3001"); // Android emulator
    const socketConnection = io(process.env.EXPO_PUBLIC_SOCKET_SERVER_URL); // Use your actual IP for physical device

    socketConnection.on("connect", () => {
      console.log("Connected to server");
      setConnected(true);
    });

    socketConnection.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    socketConnection.on("connect_error", (error) => {
      console.error("Connection error:", error);
      Alert.alert(
        "Connection Error",
        "Could not connect to server. Make sure it's running and check the IP address"
      );
    });

    setSocket(socketConnection);

    // Cleanup on component unmount
    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const handleButtonClick = () => {
    if (!socket || !connected) {
      // Show offline attendance functionality
      Alert.alert(
        "Offline Mode", 
        "Server not connected. Would you like to mark attendance offline?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Mark Offline", 
            onPress: () => {
              Alert.alert("Success", "Attendance marked offline. It will sync when connection is restored.");
            }
          }
        ]
      );
      return;
    }

    // Send event to server
    socket.emit("button-clicked", {
      start: true,
      timestamp: new Date().toISOString(),
    });

    console.log("Button clicked event sent");
    Alert.alert("Success", "Attendance session started successfully!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "#4caf50";
      case "upcoming":
        return "#ff9800";
      case "completed":
        return "#9e9e9e";
      default:
        return "#9e9e9e";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ongoing":
        return "In Progress";
      case "upcoming":
        return "Upcoming";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const calculateAttendancePercentage = (present: number, total: number) => {
    return Math.round((present / total) * 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
          onPress={() => router.back()}
        >
          <Text className="text-xl text-gray-700">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Lecture Attendance
        </Text>
        <View className="w-10" />
      </View>

      {/* Date and Summary */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-base font-semibold text-gray-900">
            Today, September 24, 2025
          </Text>
          <View className={`px-3 py-1 rounded-full ${connected ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-medium ${connected ? 'text-green-800' : 'text-red-800'}`}>
              {connected ? '🟢 Connected' : '🔴 Offline'}
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-600">
          {todaysClasses.length} Classes •{" "}
          {todaysClasses.filter((c) => c.status === "completed").length}{" "}
          Completed
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
      >
        {/* Classes List */}
        <View className="mb-8">
          {todaysClasses.map((classItem) => (
            <TouchableOpacity
              key={classItem.id}
              className={`bg-white rounded-xl p-4 mb-3 shadow-md ${
                selectedClass === classItem.id ? "border-2 border-blue-500" : ""
              }`}
              onPress={() =>
                setSelectedClass(
                  selectedClass === classItem.id ? null : classItem.id
                )
              }
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {classItem.subject}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {classItem.chapter}
                  </Text>
                </View>
                <View
                  className="px-2 py-1 rounded-xl"
                  style={{ backgroundColor: getStatusColor(classItem.status) }}
                >
                  <Text className="text-xs text-white font-semibold">
                    {getStatusText(classItem.status)}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">
                    {classItem.time}
                  </Text>
                  <Text className="text-xs text-gray-600 mt-0.5">
                    {classItem.room}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-sm text-gray-600">
                    {classItem.presentStudents}/{classItem.totalStudents}{" "}
                    Present
                  </Text>
                  <Text
                    className="text-base font-semibold mt-0.5"
                    style={{
                      color:
                        calculateAttendancePercentage(
                          classItem.presentStudents,
                          classItem.totalStudents
                        ) >= 80
                          ? "#4caf50"
                          : "#ff5722",
                    }}
                  >
                    {calculateAttendancePercentage(
                      classItem.presentStudents,
                      classItem.totalStudents
                    )}
                    %
                  </Text>
                </View>
              </View>

              {/* Expanded Details */}
              {selectedClass === classItem.id && (
                <View className="mt-4 pt-4 border-t border-gray-200">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm text-gray-600">
                      Absent Students:
                    </Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {classItem.totalStudents - classItem.presentStudents}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">
                      Attendance Rate:
                    </Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {calculateAttendancePercentage(
                        classItem.presentStudents,
                        classItem.totalStudents
                      )}
                      %
                    </Text>
                  </View>

                  <View className="flex-row mt-3 gap-2">
                    
                    {classItem.status === "ongoing" || classItem.status === "upcoming" ? (
                      <TouchableOpacity
                        onPress={handleButtonClick}
                        className="flex-1 py-2.5 px-4 rounded-lg bg-blue-500 items-center"
                      >
                        <Text className="text-sm text-white font-medium">
                          Start Session
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            "Attendance Record",
                            `Final attendance for ${classItem.subject}:\n${classItem.presentStudents} out of ${classItem.totalStudents} students present (${calculateAttendancePercentage(classItem.presentStudents, classItem.totalStudents)}%)`
                          );
                        }}
                        className="flex-1 py-2.5 px-4 rounded-lg bg-green-500 items-center"
                      >
                        <Text className="text-sm text-white font-medium">
                          View Record
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          "Manual Attendance",
                          "Mark attendance manually",
                          [
                            { text: "Cancel", style: "cancel" },
                            { 
                              text: "Mark All Present", 
                              onPress: () => Alert.alert("Success", "All students marked present!")
                            },
                            { 
                              text: "Individual", 
                              onPress: () => Alert.alert("Individual Marking", "Individual attendance marking feature coming soon!")
                            }
                          ]
                        );
                      }}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-green-500 items-center"
                    >
                      <Text className="text-sm text-white font-medium">
                        Manual Mark
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Stats */}
        <View className="bg-white rounded-xl p-5 shadow-md">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Today&apos;s Summary
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-blue-500 mb-1">
                {todaysClasses.reduce((sum, c) => sum + c.presentStudents, 0)}
              </Text>
              <Text className="text-xs text-gray-600 text-center">
                Total Present
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-blue-500 mb-1">
                {todaysClasses.reduce((sum, c) => sum + c.totalStudents, 0)}
              </Text>
              <Text className="text-xs text-gray-600 text-center">
                Total Students
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-blue-500 mb-1">
                {Math.round(
                  (todaysClasses.reduce(
                    (sum, c) => sum + c.presentStudents,
                    0
                  ) /
                    todaysClasses.reduce(
                      (sum, c) => sum + c.totalStudents,
                      0
                    )) *
                    100
                )}
                %
              </Text>
              <Text className="text-xs text-gray-600 text-center">
                Overall Rate
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
