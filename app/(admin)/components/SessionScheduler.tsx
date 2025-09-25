import { supabase } from "@/utils/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Course {
  id: string;
  code: string;
  title: string;
  semester: number;
}

interface Teacher {
  id: string;
  teacher_code: string;
  full_name: string;
  department: string;
}

interface CourseSession {
  id: string;
  course_id: string;
  teacher_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
  created_at: string;
  course?: Course;
  teacher?: Teacher;
}

export default function SessionScheduler() {
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [newSession, setNewSession] = useState({
    course_id: "",
    teacher_id: "",
    session_date: new Date(),
    start_time: new Date(),
    end_time: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
    location: "",
  });

  const [filterDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchCourses(), fetchTeachers(), fetchSessions()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .order("code");

    if (error) {
      console.error("Error fetching courses:", error);
    } else {
      setCourses(data || []);
    }
  };

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("is_active", true)
      .order("full_name");

    if (error) {
      console.error("Error fetching teachers:", error);
    } else {
      setTeachers(data || []);
    }
  };

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from("course_sessions")
      .select(
        `
        *,
        course:courses(id, code, title, semester),
        teacher:teachers(id, teacher_code, full_name, department)
      `
      )
      .order("session_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
    } else {
      setSessions(data || []);
    }
  };

  const handleScheduleSession = async () => {
    if (!newSession.course_id) {
      Alert.alert("Error", "Please select a course");
      return;
    }

    if (!newSession.teacher_id) {
      Alert.alert("Error", "Please select a teacher");
      return;
    }

    if (!newSession.location) {
      Alert.alert("Error", "Please enter a location");
      return;
    }

    setLoading(true);
    try {
      const sessionData = {
        course_id: newSession.course_id,
        teacher_id: newSession.teacher_id,
        session_date: newSession.session_date.toISOString().split("T")[0],
        start_time: newSession.start_time.toTimeString().split(" ")[0],
        end_time: newSession.end_time.toTimeString().split(" ")[0],
        location: newSession.location,
        status: "scheduled",
      };

      const { error } = await supabase
        .from("course_sessions")
        .insert([sessionData]);

      if (error) {
        Alert.alert("Error", "Failed to schedule session: " + error.message);
      } else {
        Alert.alert("Success", "Session scheduled successfully");
        setShowScheduleModal(false);
        resetSessionForm();
        fetchSessions();
      }
    } catch (error) {
      console.error("Error scheduling session:", error);
      Alert.alert("Error", "Failed to schedule session");
    } finally {
      setLoading(false);
    }
  };

  const handleStartAttendance = async (session: CourseSession) => {
    Alert.alert(
      "Start Attendance",
      `Start attendance for ${session.course?.code} - ${session.course?.title}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start",
          onPress: async () => {
            setLoading(true);
            try {
              // Update session status to "in_progress"
              const { error: updateError } = await supabase
                .from("course_sessions")
                .update({ status: "in_progress" })
                .eq("id", session.id);

              if (updateError) {
                Alert.alert("Error", "Failed to update session status");
                return;
              }

              // Prepare trigger data for App B
              const triggerData = {
                trigger: "start_session",
                session_id: session.id,
                teacher_id: session.teacher_id,
                course_id: session.course_id,
                timestamp: new Date().toISOString(),
              };

              // Here you would send this to App B via your chosen method:
              // Option 1: Via Supabase real-time or custom table
              // Option 2: Via push notification service
              // Option 3: Via websocket or other real-time communication

              // For now, we'll store it in a trigger table (you may need to create this)
              const { error: triggerError } = await supabase
                .from("attendance_triggers")
                .insert([triggerData]);

              if (!triggerError) {
                Alert.alert(
                  "Success",
                  "Attendance session started successfully. The attendance app will now begin capturing attendance.",
                  [{ text: "OK", onPress: () => fetchSessions() }]
                );
              } else {
                // If trigger table doesn't exist, just show success
                Alert.alert(
                  "Success",
                  `Session started. Trigger data:\n${JSON.stringify(triggerData, null, 2)}`,
                  [{ text: "OK", onPress: () => fetchSessions() }]
                );
              }
            } catch (error) {
              console.error("Error starting attendance:", error);
              Alert.alert("Error", "Failed to start attendance session");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEndSession = async (sessionId: string) => {
    Alert.alert("End Session", "Are you sure you want to end this session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("course_sessions")
              .update({ status: "completed" })
              .eq("id", sessionId);

            if (error) {
              Alert.alert("Error", "Failed to end session");
            } else {
              Alert.alert("Success", "Session ended successfully");
              fetchSessions();
            }
          } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "Failed to end session");
          }
        },
      },
    ]);
  };

  const resetSessionForm = () => {
    setNewSession({
      course_id: "",
      teacher_id: "",
      session_date: new Date(),
      start_time: new Date(),
      end_time: new Date(new Date().getTime() + 60 * 60 * 1000),
      location: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (filterDate) {
      const sessionDate = new Date(session.session_date);
      if (sessionDate.toDateString() !== filterDate.toDateString()) {
        return false;
      }
    }
    if (filterStatus && session.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const upcomingSessions = filteredSessions.filter(
    (s) => s.status === "scheduled"
  );
  const activeSessions = filteredSessions.filter(
    (s) => s.status === "in_progress"
  );
  const completedSessions = filteredSessions.filter(
    (s) => s.status === "completed"
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-xl font-bold text-gray-900">
            Session Scheduler
          </Text>
          <Text className="text-sm text-gray-500">
            Active: {activeSessions.length} • Upcoming:{" "}
            {upcomingSessions.length}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowScheduleModal(true)}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">+ Schedule Session</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <TouchableOpacity
          onPress={() => setFilterStatus("")}
          className={`px-3 py-1.5 rounded-full mr-2 ${
            !filterStatus ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <Text className={!filterStatus ? "text-white" : "text-gray-700"}>
            All Status
          </Text>
        </TouchableOpacity>
        {["scheduled", "in_progress", "completed"].map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-full mr-2 ${
              filterStatus === status ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <Text
              className={
                filterStatus === status ? "text-white" : "text-gray-700"
              }
            >
              {status.replace("_", " ").charAt(0).toUpperCase() +
                status.slice(1).replace("_", " ")}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sessions List */}
      {loading && sessions.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Active Sessions */}
          {activeSessions.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                ACTIVE SESSIONS
              </Text>
              {activeSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onStart={() => {}}
                  onEnd={() => handleEndSession(session.id)}
                  getStatusColor={getStatusColor}
                />
              ))}
            </View>
          )}

          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                UPCOMING SESSIONS
              </Text>
              {upcomingSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onStart={() => handleStartAttendance(session)}
                  onEnd={() => {}}
                  getStatusColor={getStatusColor}
                />
              ))}
            </View>
          )}

          {/* Completed Sessions */}
          {completedSessions.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                COMPLETED SESSIONS
              </Text>
              {completedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onStart={() => {}}
                  onEnd={() => {}}
                  getStatusColor={getStatusColor}
                />
              ))}
            </View>
          )}

          {filteredSessions.length === 0 && !loading && (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-6xl mb-3">📅</Text>
              <Text className="text-gray-500 text-center">
                No sessions found{"\n"}Schedule a session to get started
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Schedule Session Modal */}
      <Modal visible={showScheduleModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-center items-center px-4">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            <View className="bg-white rounded-2xl p-5 w-full max-w-md">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Schedule New Session
              </Text>

              {/* Course Selection */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Select Course *
                </Text>
                <ScrollView
                  className="max-h-24"
                  showsVerticalScrollIndicator={true}
                >
                  {courses.map((course) => (
                    <TouchableOpacity
                      key={course.id}
                      onPress={() =>
                        setNewSession({ ...newSession, course_id: course.id })
                      }
                      className={`p-2.5 rounded-lg mb-1.5 border ${
                        newSession.course_id === course.id
                          ? "bg-blue-50 border-blue-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <Text className="font-medium text-gray-900 text-sm">
                        {course.code}: {course.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Teacher Selection */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Select Teacher *
                </Text>
                <ScrollView
                  className="max-h-24"
                  showsVerticalScrollIndicator={true}
                >
                  {teachers.map((teacher) => (
                    <TouchableOpacity
                      key={teacher.id}
                      onPress={() =>
                        setNewSession({ ...newSession, teacher_id: teacher.id })
                      }
                      className={`p-2.5 rounded-lg mb-1.5 border ${
                        newSession.teacher_id === teacher.id
                          ? "bg-blue-50 border-blue-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <Text className="font-medium text-gray-900 text-sm">
                        {teacher.full_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Date & Time Selection */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Session Date & Time *
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="border border-gray-300 p-3 rounded-lg bg-gray-50 mb-2"
                >
                  <Text className="text-gray-900">
                    {newSession.session_date.toDateString()}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setShowStartTimePicker(true)}
                    className="flex-1 border border-gray-300 p-3 rounded-lg bg-gray-50"
                  >
                    <Text className="text-xs text-gray-600">Start Time</Text>
                    <Text className="text-gray-900">
                      {newSession.start_time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowEndTimePicker(true)}
                    className="flex-1 border border-gray-300 p-3 rounded-lg bg-gray-50"
                  >
                    <Text className="text-xs text-gray-600">End Time</Text>
                    <Text className="text-gray-900">
                      {newSession.end_time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Location */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Location *
                </Text>
                <TextInput
                  placeholder="e.g., Room 101, Lab A"
                  value={newSession.location}
                  onChangeText={(text) =>
                    setNewSession({ ...newSession, location: text })
                  }
                  className="border border-gray-300 p-3 rounded-lg bg-gray-50"
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setShowScheduleModal(false);
                    resetSessionForm();
                  }}
                  className="flex-1 bg-gray-100 p-3 rounded-lg"
                >
                  <Text className="text-center text-gray-700 font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleScheduleSession}
                  disabled={loading}
                  className={`flex-1 p-3 rounded-lg ${
                    loading ? "bg-gray-400" : "bg-blue-600"
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-center text-white font-semibold">
                      Schedule
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={newSession.session_date}
          mode="date"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setNewSession({ ...newSession, session_date: date });
          }}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={newSession.start_time}
          mode="time"
          onChange={(event, time) => {
            setShowStartTimePicker(false);
            if (time) setNewSession({ ...newSession, start_time: time });
          }}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={newSession.end_time}
          mode="time"
          onChange={(event, time) => {
            setShowEndTimePicker(false);
            if (time) setNewSession({ ...newSession, end_time: time });
          }}
        />
      )}
    </View>
  );
}

// Session Card Component
function SessionCard({ session, onStart, onEnd, getStatusColor }: any) {
  const canStart =
    session.status === "scheduled" &&
    new Date(session.session_date).toDateString() === new Date().toDateString();

  return (
    <View className="bg-gray-50 p-4 rounded-xl mb-3 border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="font-bold text-gray-900 text-base">
            {session.course?.code}: {session.course?.title}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            {session.teacher?.full_name}
          </Text>
        </View>
        <View
          className={`px-2 py-1 rounded-full ${getStatusColor(session.status)}`}
        >
          <Text className="text-xs font-medium">
            {session.status.replace("_", " ").toUpperCase()}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3 mb-3">
        <Text className="text-sm text-gray-500">
          📅 {new Date(session.session_date).toLocaleDateString()}
        </Text>
        <Text className="text-sm text-gray-500">
          ⏰ {session.start_time} - {session.end_time}
        </Text>
        <Text className="text-sm text-gray-500">📍 {session.location}</Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2">
        {canStart && (
          <TouchableOpacity
            onPress={onStart}
            className="flex-1 bg-green-600 py-2 px-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-sm">
              Start Attendance
            </Text>
          </TouchableOpacity>
        )}

        {session.status === "in_progress" && (
          <TouchableOpacity
            onPress={onEnd}
            className="flex-1 bg-red-600 py-2 px-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-sm">
              End Session
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
