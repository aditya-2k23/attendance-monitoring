import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import uuid from "react-native-uuid";

type Role = "student" | "teacher";

interface AddUserProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (payload: { auth_user_id: string }) => void;
}

export default function AddUser({ visible, onClose, onCreated }: AddUserProps) {
  const { refreshUser } = useAuth();
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    userId: "", // teacher_code for teachers, not used for students
    role: "student" as Role,
    department: "",
    enrollmentYear: new Date().getFullYear(), // for students
    photoUri: "" as string | null,
    tempPassword: "", // new user's temporary password (admin sets)
    adminPassword: "", // admin's own password to re-authenticate
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () =>
    setNewUser({
      name: "",
      email: "",
      phone: "",
      userId: "",
      role: "student",
      department: "",
      enrollmentYear: new Date().getFullYear(),
      photoUri: null,
      tempPassword: "",
      adminPassword: "",
    });

  const showPhotoOptions = () => {
    Alert.alert("Add Photo", "Choose how you want to add a photo", [
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Gallery", onPress: handleSelectPhoto },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Camera permission is needed.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      setNewUser({ ...newUser, photoUri: result.assets[0].uri });
    }
  };

  const handleSelectPhoto = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Photo library permission is needed.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      setNewUser({ ...newUser, photoUri: result.assets[0].uri });
    }
  };

  async function uploadPhotoToSupabase(uri: string | null) {
    if (!uri) return null;
    try {
      const filename = `${newUser.role}-${uuid.v4()}.jpg`;

      // For React Native, we need to use FormData or ArrayBuffer
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error } = await supabase.storage
        .from("student-photos") // ensure this bucket exists
        .upload(filename, arrayBuffer, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return null;
      }

      // If bucket is public:
      const publicUrl = supabase.storage
        .from("student-photos")
        .getPublicUrl(filename).data.publicUrl;
      return publicUrl || null;
    } catch (err) {
      console.error("uploadPhotoToSupabase error:", err);
      return null;
    }
  }

  const handleAddUser = async () => {
    // Enhanced validation
    if (!newUser.name || !newUser.email || !newUser.department) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    // Teacher validation - teacher_code is required for teachers
    if (newUser.role === "teacher" && !newUser.userId) {
      Alert.alert("Error", "Teacher code is required for teachers.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    if (!newUser.tempPassword) {
      Alert.alert("Error", "Please set a temporary password for the new user.");
      return;
    }
    if (newUser.tempPassword.length < 6) {
      Alert.alert(
        "Error",
        "Temporary password must be at least 6 characters long."
      );
      return;
    }
    if (!newUser.adminPassword) {
      Alert.alert("Error", "Please enter your admin password to confirm.");
      return;
    }

    setLoading(true);

    try {
      // 0) grab admin session (to get admin email)
      const { data: sessionData } = await supabase.auth.getSession();
      const adminSession = (sessionData as any)?.session;
      if (!adminSession) {
        Alert.alert("Not signed in", "Please sign in as admin to add users.");
        setLoading(false);
        return;
      }
      const adminEmail = adminSession.user?.email;
      if (!adminEmail) {
        Alert.alert("Error", "Can't determine admin email from session.");
        setLoading(false);
        return;
      }

      // 1) optionally upload photo (as admin, before creating new user)
      const photo_url = await uploadPhotoToSupabase(newUser.photoUri);

      // 2) create the new auth user via client-side signUp
      // This will sign the app in as the new user temporarily.
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp(
        {
          email: newUser.email,
          password: newUser.tempPassword,
          options: {
            data: {
              full_name: newUser.name,
              role: newUser.role,
              department: newUser.department,
            },
          },
        }
      );

      if (signUpErr) {
        console.error("signUp error", signUpErr);
        Alert.alert(
          "Error creating auth user",
          signUpErr.message || String(signUpErr)
        );
        setLoading(false);
        return;
      }

      // signUp usually returns created user in signUpData.user (or data.user)
      const createdUserId =
        (signUpData as any)?.user?.id || (signUpData as any)?.id;
      if (!createdUserId) {
        console.warn(
          "Could not get created user id from signUp response:",
          signUpData
        );
        Alert.alert(
          "Warning",
          "User created but couldn't read user id. Please check in Supabase console."
        );
      }

      // 3) immediately sign back in as admin using admin email + adminPassword provided
      const { error: signInBackErr } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: newUser.adminPassword,
      });

      if (signInBackErr) {
        console.error("Failed to sign back in as admin", signInBackErr);
        Alert.alert(
          "Error",
          "Failed to restore admin session. You may need to login again manually."
        );
        setLoading(false);
        return;
      }

      // 4) now we're back as admin — insert profile row into students or teachers table
      const profilePayload: any = {
        auth_user_id: createdUserId,
        full_name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || null,
        department: newUser.department,
        photo_url: photo_url || null,
        is_active: true,
      };

      // Add role-specific fields
      if (newUser.role === "student") {
        profilePayload.enrollment_year = newUser.enrollmentYear;
      }
      if (newUser.role === "teacher" && newUser.userId) {
        profilePayload.teacher_code = newUser.userId;
      }

      const tableName = newUser.role === "student" ? "students" : "teachers";
      const { error: insertErr } = await supabase
        .from(tableName)
        .insert([profilePayload]);

      if (insertErr) {
        console.error("Profile insert error", insertErr);
        Alert.alert(
          "Error",
          "Failed to insert profile row: " + insertErr.message
        );
        setLoading(false);
        return;
      }

      // success
      Alert.alert("Success", `${newUser.role} ${newUser.name} added.`);

      // Refresh the admin user context to ensure they stay logged in
      await refreshUser();

      onCreated?.({ auth_user_id: createdUserId });
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while creating user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/60 justify-center items-center px-3">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-white rounded-2xl p-5 w-full min-w-[350px] shadow-lg">
            {/* Header */}
            <View className="items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-blue-50 justify-center items-center">
                <Text className="text-xl">👥</Text>
              </View>
              <Text className="text-xl font-bold text-gray-800">
                Add New User
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Create a new{" "}
                <Text className="font-semibold">{newUser.role}</Text> account
              </Text>
            </View>

            {/* Role Selection */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2.5">
                User Type
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setNewUser({ ...newUser, role: "teacher" })}
                  className={`flex-1 p-3 rounded-xl border-2 items-center ${
                    newUser.role === "teacher"
                      ? "bg-blue-600 border-blue-600"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text className="text-lg mb-0.5">👨‍🏫</Text>
                  <Text
                    className={`font-semibold text-sm ${
                      newUser.role === "teacher"
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    Teacher
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNewUser({ ...newUser, role: "student" })}
                  className={`flex-1 p-3 rounded-xl border-2 items-center ${
                    newUser.role === "student"
                      ? "bg-blue-600 border-blue-600"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text className="text-lg mb-0.5">🎓</Text>
                  <Text
                    className={`font-semibold text-sm ${
                      newUser.role === "student"
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    Student
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Photo Section */}
            <View className="items-center mb-4.5">
              {newUser.photoUri ? (
                <View className="items-center">
                  <Image
                    source={{ uri: newUser.photoUri }}
                    className="w-20 h-20 rounded-full mb-2 border-2 border-gray-200"
                  />
                  <TouchableOpacity
                    onPress={showPhotoOptions}
                    className="px-3 py-1.5 bg-gray-100 rounded-2xl border border-gray-300"
                  >
                    <Text className="text-gray-700 font-medium text-xs">
                      Change Photo
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={showPhotoOptions}
                  className="w-20 h-20 rounded-full bg-gray-50 border-2 border-gray-200 border-dashed justify-center items-center mb-2"
                >
                  <Text className="text-2xl">📷</Text>
                  <Text className="text-xs text-gray-500 text-center">
                    Add Photo
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Form Fields */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                Basic Information
              </Text>

              <View className="mb-2.5">
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Full Name *
                </Text>
                <TextInput
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChangeText={(t) => setNewUser({ ...newUser, name: t })}
                  className="border border-gray-300 p-3 rounded-xl text-sm bg-gray-50"
                />
              </View>

              <View className="mb-2.5">
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Email Address *
                </Text>
                <TextInput
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChangeText={(t) => setNewUser({ ...newUser, email: t })}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="border border-gray-300 p-3.5 rounded-xl text-base bg-gray-50"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </Text>
                <TextInput
                  placeholder="Enter phone number"
                  value={newUser.phone}
                  onChangeText={(t) => setNewUser({ ...newUser, phone: t })}
                  keyboardType="phone-pad"
                  className="border border-gray-300 p-3.5 rounded-xl text-base bg-gray-50"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Department *
                </Text>
                <TextInput
                  placeholder="Enter department"
                  value={newUser.department}
                  onChangeText={(t) =>
                    setNewUser({ ...newUser, department: t })
                  }
                  className="border border-gray-300 p-3.5 rounded-xl text-base bg-gray-50"
                />
              </View>

              {newUser.role === "teacher" && (
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-1.5">
                    Teacher Code *
                  </Text>
                  <TextInput
                    placeholder="Enter teacher code"
                    value={newUser.userId}
                    onChangeText={(t) => setNewUser({ ...newUser, userId: t })}
                    className="border border-gray-300 p-3.5 rounded-xl text-base bg-gray-50"
                  />
                </View>
              )}

              {newUser.role === "student" && (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-1.5">
                    Enrollment Year
                  </Text>
                  <TextInput
                    placeholder="Enter enrollment year"
                    value={newUser.enrollmentYear.toString()}
                    onChangeText={(t) =>
                      setNewUser({
                        ...newUser,
                        enrollmentYear: parseInt(t) || new Date().getFullYear(),
                      })
                    }
                    keyboardType="numeric"
                    className="border border-gray-300 p-3.5 rounded-xl text-base bg-gray-50"
                  />
                </View>
              )}
            </View>

            {/* Security Section */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-3">
                Account Security
              </Text>

              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Temporary Password (for new user) *
                </Text>
                <TextInput
                  placeholder="Set temporary password"
                  value={newUser.tempPassword}
                  onChangeText={(t) =>
                    setNewUser({ ...newUser, tempPassword: t })
                  }
                  secureTextEntry
                  className="border border-gray-300 p-3 rounded-xl text-sm bg-gray-50"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Your Admin Password *
                </Text>
                <TextInput
                  placeholder="Enter your admin password"
                  value={newUser.adminPassword}
                  onChangeText={(t) =>
                    setNewUser({ ...newUser, adminPassword: t })
                  }
                  secureTextEntry
                  className="border border-gray-300 p-3 rounded-xl text-sm bg-gray-50"
                />
                <Text className="text-xs text-gray-500 mt-1">
                  Required to verify your identity
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  onClose();
                }}
                className="flex-1 bg-gray-100 p-3.5 rounded-xl border border-gray-300"
              >
                <Text className="text-center text-gray-700 font-semibold text-sm">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddUser}
                disabled={loading}
                className={`flex-1 p-3.5 rounded-xl shadow-md ${
                  loading ? "bg-gray-400" : "bg-blue-600"
                }`}
              >
                {loading ? (
                  <View className="flex-row justify-center items-center">
                    <ActivityIndicator color="#fff" size="small" />
                    <Text className="ml-1.5 text-white font-semibold text-sm">
                      Creating...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-center text-white font-semibold text-sm">
                    Create User
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
