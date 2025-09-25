import { supabase } from "@/utils/supabase";
import { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Switch,
} from "react-native";

interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  semester: number;
  is_active: boolean;
  created_at: string;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    credits: 3,
    semester: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching courses:", error);
        Alert.alert("Error", "Failed to fetch courses");
      } else {
        setCourses(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    // Validation
    if (!newCourse.code || !newCourse.title) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (newCourse.credits < 1 || newCourse.credits > 10) {
      Alert.alert("Error", "Credits must be between 1 and 10");
      return;
    }

    if (newCourse.semester < 1 || newCourse.semester > 8) {
      Alert.alert("Error", "Semester must be between 1 and 8");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from("courses").insert([
        {
          code: newCourse.code.toUpperCase(),
          title: newCourse.title,
          credits: newCourse.credits,
          semester: newCourse.semester,
          is_active: newCourse.is_active,
        },
      ]).select();

      if (error) {
        if (error.code === "23505") {
          Alert.alert("Error", "A course with this code already exists");
        } else {
          Alert.alert("Error", error.message);
        }
      } else {
        Alert.alert("Success", "Course added successfully");
        setShowAddModal(false);
        setNewCourse({
          code: "",
          title: "",
          credits: 3,
          semester: 1,
          is_active: true,
        });
        fetchCourses();
      }
    } catch (error) {
      console.error("Error adding course:", error);
      Alert.alert("Error", "Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({ is_active: !currentStatus })
        .eq("id", courseId);

      if (error) {
        Alert.alert("Error", "Failed to update course status");
      } else {
        fetchCourses();
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to update course");
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-xl font-bold text-gray-900">Course Management</Text>
          <Text className="text-sm text-gray-500">
            Total Courses: {courses.length}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">+ Add Course</Text>
        </TouchableOpacity>
      </View>

      {/* Courses List */}
      {loading && courses.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {courses.map((course) => (
            <View
              key={course.id}
              className="bg-gray-50 p-4 rounded-xl mb-3 border border-gray-200"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="font-bold text-gray-900 text-base">
                      {course.code}
                    </Text>
                    <View
                      className={`ml-2 px-2 py-0.5 rounded-full ${
                        course.is_active ? "bg-green-100" : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          course.is_active ? "text-green-700" : "text-gray-600"
                        }`}
                      >
                        {course.is_active ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-700 font-medium mb-2">
                    {course.title}
                  </Text>
                  <View className="flex-row gap-4">
                    <Text className="text-sm text-gray-500">
                      Credits: {course.credits}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Semester: {course.semester}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={course.is_active}
                  onValueChange={() => toggleCourseStatus(course.id, course.is_active)}
                  trackColor={{ false: "#d1d5db", true: "#60a5fa" }}
                  thumbColor={course.is_active ? "#2563eb" : "#6b7280"}
                />
              </View>
            </View>
          ))}

          {courses.length === 0 && !loading && (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-6xl mb-3">📚</Text>
              <Text className="text-gray-500 text-center">
                No courses found{"\n"}Add your first course to get started
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Add Course Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-center items-center px-4">
          <View className="bg-white rounded-2xl p-5 w-full max-w-md">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Add New Course
            </Text>

            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Course Code *
              </Text>
              <TextInput
                placeholder="e.g., CS101"
                value={newCourse.code}
                onChangeText={(text) => setNewCourse({ ...newCourse, code: text })}
                className="border border-gray-300 p-3 rounded-lg bg-gray-50"
                autoCapitalize="characters"
              />
            </View>

            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Course Title *
              </Text>
              <TextInput
                placeholder="e.g., Introduction to Computer Science"
                value={newCourse.title}
                onChangeText={(text) => setNewCourse({ ...newCourse, title: text })}
                className="border border-gray-300 p-3 rounded-lg bg-gray-50"
              />
            </View>

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Credits
                </Text>
                <TextInput
                  placeholder="3"
                  value={newCourse.credits.toString()}
                  onChangeText={(text) =>
                    setNewCourse({
                      ...newCourse,
                      credits: parseInt(text) || 3,
                    })
                  }
                  keyboardType="numeric"
                  className="border border-gray-300 p-3 rounded-lg bg-gray-50"
                />
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Semester
                </Text>
                <TextInput
                  placeholder="1"
                  value={newCourse.semester.toString()}
                  onChangeText={(text) =>
                    setNewCourse({
                      ...newCourse,
                      semester: parseInt(text) || 1,
                    })
                  }
                  keyboardType="numeric"
                  className="border border-gray-300 p-3 rounded-lg bg-gray-50"
                />
              </View>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm font-medium text-gray-700">Active</Text>
              <Switch
                value={newCourse.is_active}
                onValueChange={(value) =>
                  setNewCourse({ ...newCourse, is_active: value })
                }
                trackColor={{ false: "#d1d5db", true: "#60a5fa" }}
                thumbColor={newCourse.is_active ? "#2563eb" : "#6b7280"}
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setNewCourse({
                    code: "",
                    title: "",
                    credits: 3,
                    semester: 1,
                    is_active: true,
                  });
                }}
                className="flex-1 bg-gray-100 p-3 rounded-lg"
              >
                <Text className="text-center text-gray-700 font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddCourse}
                disabled={loading}
                className={`flex-1 p-3 rounded-lg ${
                  loading ? "bg-gray-400" : "bg-blue-600"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-center text-white font-semibold">
                    Add Course
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