import { supabase } from "@/utils/supabase";
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

interface Teacher {
  id: string;
  teacher_code: string;
  full_name: string;
  email: string;
  department: string;
}

interface Course {
  id: string;
  code: string;
  title: string;
  semester: number;
}

interface CourseTeacher {
  id: string;
  course_id: string;
  teacher_id: string;
  role: string;
  created_at: string;
  teacher?: Teacher;
  course?: Course;
}

export default function TeacherAssignment() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<CourseTeacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [teacherRole, setTeacherRole] = useState<string>("Primary");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTeachers(), fetchCourses(), fetchAssignments()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

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

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from("course_teachers")
      .select(
        `
        *,
        teacher:teachers(id, teacher_code, full_name, email, department),
        course:courses(id, code, title, semester)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching assignments:", error);
    } else {
      setAssignments(data || []);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedCourse) {
      Alert.alert("Error", "Please select a course");
      return;
    }

    if (!selectedTeacher) {
      Alert.alert("Error", "Please select a teacher");
      return;
    }

    setLoading(true);
    try {
      // Check if assignment already exists
      const { data: existing } = await supabase
        .from("course_teachers")
        .select("id")
        .eq("course_id", selectedCourse)
        .eq("teacher_id", selectedTeacher)
        .single();

      if (existing) {
        Alert.alert("Info", "This teacher is already assigned to this course");
        return;
      }

      const { error } = await supabase.from("course_teachers").insert([
        {
          course_id: selectedCourse,
          teacher_id: selectedTeacher,
          role: teacherRole,
        },
      ]);

      if (error) {
        Alert.alert("Error", "Failed to assign teacher: " + error.message);
      } else {
        Alert.alert("Success", "Teacher assigned successfully");
        setShowAssignModal(false);
        resetAssignmentForm();
        fetchAssignments();
      }
    } catch (error) {
      console.error("Error assigning teacher:", error);
      Alert.alert("Error", "Failed to assign teacher");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    Alert.alert(
      "Remove Assignment",
      "Are you sure you want to remove this teacher assignment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("course_teachers")
                .delete()
                .eq("id", assignmentId);

              if (error) {
                Alert.alert("Error", "Failed to remove assignment");
              } else {
                Alert.alert("Success", "Assignment removed successfully");
                fetchAssignments();
              }
            } catch (error) {
              console.error("Error:", error);
              Alert.alert("Error", "Failed to remove assignment");
            }
          },
        },
      ]
    );
  };

  const resetAssignmentForm = () => {
    setSelectedCourse("");
    setSelectedTeacher("");
    setTeacherRole("Primary");
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        assignment.teacher?.full_name.toLowerCase().includes(query) ||
        assignment.teacher?.teacher_code.toLowerCase().includes(query) ||
        assignment.course?.code.toLowerCase().includes(query) ||
        assignment.course?.title.toLowerCase().includes(query) ||
        assignment.role?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Get available teachers for selected course (not already assigned)
  const availableTeachers = teachers.filter((teacher) => {
    if (!selectedCourse) return true;

    const isAssigned = assignments.some(
      (a) => a.course_id === selectedCourse && a.teacher_id === teacher.id
    );
    return !isAssigned;
  });

  // Group assignments by course for better visualization
  const assignmentsByCourse = courses
    .map((course) => ({
      course,
      teachers: assignments.filter((a) => a.course_id === course.id),
    }))
    .filter((group) => group.teachers.length > 0);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-xl font-bold text-gray-900">
            Teacher Assignments
          </Text>
          <Text className="text-sm text-gray-500">
            Total Assignments: {assignments.length}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAssignModal(true)}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">+ Assign Teacher</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="mb-4">
        <TextInput
          placeholder="Search by teacher name, course, or role..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />
      </View>

      {/* Assignments List */}
      {loading && assignments.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {assignmentsByCourse.map(({ course, teachers: courseTeachers }) => (
            <View key={course.id} className="mb-6">
              <View className="bg-blue-50 px-3 py-2 rounded-t-lg">
                <Text className="font-bold text-blue-900">
                  {course.code}: {course.title}
                </Text>
                <Text className="text-xs text-blue-700">
                  Semester {course.semester} • {courseTeachers.length}{" "}
                  teacher(s)
                </Text>
              </View>

              {courseTeachers.map((assignment) => (
                <View
                  key={assignment.id}
                  className="bg-white p-4 border-x border-b border-gray-200 last:rounded-b-lg"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        {assignment.teacher?.full_name}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {assignment.teacher?.teacher_code} •{" "}
                        {assignment.teacher?.department}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <View className="bg-green-100 px-2 py-0.5 rounded">
                          <Text className="text-xs text-green-700 font-medium">
                            {assignment.role || "Primary"}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveAssignment(assignment.id)}
                      className="p-2"
                    >
                      <Text className="text-red-500 text-sm">Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}

          {filteredAssignments.length === 0 && !loading && (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-6xl mb-3">👩‍🏫</Text>
              <Text className="text-gray-500 text-center">
                No teacher assignments found{"\n"}Assign teachers to courses to
                get started
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Assign Teacher Modal */}
      <Modal visible={showAssignModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-center items-center px-4">
          <View className="bg-white rounded-2xl p-5 w-full max-w-md">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Assign Teacher to Course
            </Text>

            {/* Course Selection */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Select Course *
              </Text>
              <ScrollView
                className="max-h-32"
                showsVerticalScrollIndicator={true}
              >
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    onPress={() => setSelectedCourse(course.id)}
                    className={`p-3 rounded-lg mb-2 border ${
                      selectedCourse === course.id
                        ? "bg-blue-50 border-blue-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Text className="font-medium text-gray-900">
                      {course.code}: {course.title}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      Semester {course.semester}
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
                className="max-h-32"
                showsVerticalScrollIndicator={true}
              >
                {availableTeachers.map((teacher) => (
                  <TouchableOpacity
                    key={teacher.id}
                    onPress={() => setSelectedTeacher(teacher.id)}
                    className={`p-3 rounded-lg mb-2 border ${
                      selectedTeacher === teacher.id
                        ? "bg-blue-50 border-blue-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Text className="font-medium text-gray-900">
                      {teacher.full_name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {teacher.teacher_code} • {teacher.department}
                    </Text>
                  </TouchableOpacity>
                ))}
                {availableTeachers.length === 0 && selectedCourse && (
                  <Text className="text-gray-500 text-center py-3">
                    No available teachers for this course
                  </Text>
                )}
              </ScrollView>
            </View>

            {/* Role Selection */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Role
              </Text>
              <View className="flex-row gap-2">
                {["Primary", "Assistant", "Guest"].map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setTeacherRole(role)}
                    className={`flex-1 p-2 rounded-lg border ${
                      teacherRole === role
                        ? "bg-blue-600 border-blue-600"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        teacherRole === role ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowAssignModal(false);
                  resetAssignmentForm();
                }}
                className="flex-1 bg-gray-100 p-3 rounded-lg"
              >
                <Text className="text-center text-gray-700 font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAssignTeacher}
                disabled={loading || !selectedCourse || !selectedTeacher}
                className={`flex-1 p-3 rounded-lg ${
                  loading || !selectedCourse || !selectedTeacher
                    ? "bg-gray-400"
                    : "bg-blue-600"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-center text-white font-semibold">
                    Assign
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
