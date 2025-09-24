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

interface Student {
  id: string;
  full_name: string;
  email: string;
  department: string;
  enrollment_year: number;
}

interface Course {
  id: string;
  code: string;
  title: string;
  semester: number;
}

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_on: string;
  is_active: boolean;
  student?: Student;
  course?: Course;
}

export default function EnrollmentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("");

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStudents(), fetchCourses(), fetchEnrollments()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("is_active", true)
      .order("full_name");

    if (error) {
      console.error("Error fetching students:", error);
    } else {
      setStudents(data || []);
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

  const fetchEnrollments = async () => {
    const { data, error } = await supabase
      .from("enrollments")
      .select(
        `
        *,
        student:students(id, full_name, email, department),
        course:courses(id, code, title, semester)
      `
      )
      .eq("is_active", true)
      .order("enrolled_on", { ascending: false });

    if (error) {
      console.error("Error fetching enrollments:", error);
    } else {
      setEnrollments(data || []);
    }
  };

  const handleEnrollStudents = async () => {
    if (!selectedCourse) {
      Alert.alert("Error", "Please select a course");
      return;
    }

    if (selectedStudents.length === 0) {
      Alert.alert("Error", "Please select at least one student");
      return;
    }

    setLoading(true);
    try {
      // Check for existing enrollments
      const { data: existingEnrollments } = await supabase
        .from("enrollments")
        .select("student_id")
        .eq("course_id", selectedCourse)
        .in("student_id", selectedStudents);

      const existingStudentIds =
        existingEnrollments?.map((e) => e.student_id) || [];
      const newStudentIds = selectedStudents.filter(
        (id) => !existingStudentIds.includes(id)
      );

      if (newStudentIds.length === 0) {
        Alert.alert(
          "Info",
          "All selected students are already enrolled in this course"
        );
        return;
      }

      // Create enrollments for new students
      const enrollmentData = newStudentIds.map((studentId) => ({
        student_id: studentId,
        course_id: selectedCourse,
        is_active: true,
      }));

      const { error } = await supabase
        .from("enrollments")
        .insert(enrollmentData);

      if (error) {
        Alert.alert("Error", "Failed to enroll students: " + error.message);
      } else {
        Alert.alert(
          "Success",
          `Successfully enrolled ${newStudentIds.length} student(s)`
        );
        setShowEnrollModal(false);
        setSelectedCourse("");
        setSelectedStudents([]);
        fetchEnrollments();
      }
    } catch (error) {
      console.error("Error enrolling students:", error);
      Alert.alert("Error", "Failed to enroll students");
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (filterCourse && enrollment.course_id !== filterCourse) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        enrollment.student?.full_name.toLowerCase().includes(query) ||
        enrollment.student?.email.toLowerCase().includes(query) ||
        enrollment.course?.code.toLowerCase().includes(query) ||
        enrollment.course?.title.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const availableStudents = students.filter((student) => {
    if (!selectedCourse) return false; // Don't show students if no course selected

    // Filter out students already enrolled in the selected course
    const isEnrolled = enrollments.some(
      (e) =>
        e.course_id === selectedCourse &&
        e.student_id === student.id &&
        e.is_active
    );
    return !isEnrolled;
  });

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-xl font-bold text-gray-900">Enrollments</Text>
          <Text className="text-sm text-gray-500">
            Total Active: {enrollments.filter((e) => e.is_active).length}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowEnrollModal(true)}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">+ Enroll Students</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="mb-4">
        <TextInput
          placeholder="Search by student name, email, or course..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50 mb-2"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setFilterCourse("")}
            className={`px-3 py-1.5 rounded-full mr-2 ${
              !filterCourse ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <Text className={!filterCourse ? "text-white" : "text-gray-700"}>
              All Courses
            </Text>
          </TouchableOpacity>
          {courses.map((course) => (
            <TouchableOpacity
              key={course.id}
              onPress={() => setFilterCourse(course.id)}
              className={`px-3 py-1.5 rounded-full mr-2 ${
                filterCourse === course.id ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <Text
                className={
                  filterCourse === course.id ? "text-white" : "text-gray-700"
                }
              >
                {course.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Enrollments List */}
      {loading && enrollments.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredEnrollments.map((enrollment) => (
            <View
              key={enrollment.id}
              className="bg-gray-50 p-4 rounded-xl mb-3 border border-gray-200"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-base mb-1">
                    {enrollment.student?.full_name}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-1">
                    {enrollment.student?.email}
                  </Text>
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="bg-blue-100 px-2 py-0.5 rounded">
                      <Text className="text-xs text-blue-700 font-medium">
                        {enrollment.course?.code}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500">
                      {enrollment.course?.title}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500">
                    Enrolled:{" "}
                    {new Date(enrollment.enrolled_on).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  className={`px-2 py-1 rounded-full ${
                    enrollment.is_active ? "bg-green-100" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      enrollment.is_active ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    {enrollment.is_active ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {filteredEnrollments.length === 0 && !loading && (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-6xl mb-3">📚</Text>
              <Text className="text-gray-500 text-center">
                No enrollments found{"\n"}Enroll students to courses to get
                started
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Enroll Students Modal */}
      <Modal visible={showEnrollModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-center items-center px-4">
          <View
            className="bg-white rounded-2xl p-5 w-full max-w-md"
            style={{ maxHeight: "85%" }}
          >
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Enroll Students
            </Text>

            {/* Debug Info (remove in production) */}
            <View className="mb-2 p-2 bg-yellow-50 rounded">
              <Text className="text-xs text-gray-600">
                Debug: Students: {students.length}, Courses: {courses.length},
                Available: {availableStudents.length}, Selected:{" "}
                {selectedStudents.length}
              </Text>
            </View>

            {/* Course Selection */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Select Course *
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-2"
              >
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    onPress={() => setSelectedCourse(course.id)}
                    className={`px-3 py-2 rounded-lg mr-2 border ${
                      selectedCourse === course.id
                        ? "bg-blue-600 border-blue-600"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        selectedCourse === course.id
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {course.code}
                    </Text>
                    <Text
                      className={`text-xs ${
                        selectedCourse === course.id
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      Sem {course.semester}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {selectedCourse && (
                <Text className="text-xs text-gray-600">
                  {courses.find((c) => c.id === selectedCourse)?.title}
                </Text>
              )}
            </View>

            {/* Students Selection */}
            <View className="mb-4" style={{ minHeight: 200, maxHeight: 300 }}>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Select Students * ({selectedStudents.length} selected)
              </Text>
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {availableStudents.length > 0 ? (
                  availableStudents.map((student) => (
                    <TouchableOpacity
                      key={student.id}
                      onPress={() => toggleStudentSelection(student.id)}
                      className={`p-3 rounded-lg mb-2 border ${
                        selectedStudents.includes(student.id)
                          ? "bg-blue-50 border-blue-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <View className="flex-row items-center">
                        <View className="flex-1">
                          <Text className="font-medium text-gray-900">
                            {student.full_name}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {student.department} • Year{" "}
                            {new Date().getFullYear() -
                              student.enrollment_year +
                              1}
                          </Text>
                        </View>
                        {selectedStudents.includes(student.id) && (
                          <Text className="text-blue-600 text-lg">✓</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : selectedCourse ? (
                  <View className="p-4 text-center">
                    <Text className="text-gray-500 text-sm">
                      {students.length === 0
                        ? "No students found in the database"
                        : "All students are already enrolled in this course"}
                    </Text>
                  </View>
                ) : (
                  <View className="p-4 text-center">
                    <Text className="text-gray-500 text-sm">
                      Please select a course first
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowEnrollModal(false);
                  setSelectedCourse("");
                  setSelectedStudents([]);
                }}
                className="flex-1 bg-gray-100 p-3 rounded-lg"
              >
                <Text className="text-center text-gray-700 font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEnrollStudents}
                disabled={
                  loading || !selectedCourse || selectedStudents.length === 0
                }
                className={`flex-1 p-3 rounded-lg ${
                  loading || !selectedCourse || selectedStudents.length === 0
                    ? "bg-gray-400"
                    : "bg-blue-600"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-center text-white font-semibold">
                    {!selectedCourse
                      ? "Select Course"
                      : selectedStudents.length === 0
                        ? "Select Students"
                        : `Enroll ${selectedStudents.length} Student(s)`}
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
