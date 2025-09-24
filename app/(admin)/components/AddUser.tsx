import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
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

  // ------------------ Helpers ------------------
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

  /**
   * Validate the user payload BEFORE any network calls / uploads.
   * Returns an array of issues; empty array means ok.
   */
  const validateNewUser = () => {
    const errs: string[] = [];
    const {
      name,
      email,
      department,
      role,
      userId,
      enrollmentYear,
      tempPassword,
      adminPassword,
      phone,
    } = newUser;

    if (!name.trim()) errs.push("Full name is required.");
    if (name.trim().length < 3)
      errs.push("Full name must be at least 3 characters.");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) errs.push("Email is required.");
    else if (!emailRegex.test(email)) errs.push("Email format is invalid.");

    if (!department.trim()) errs.push("Department is required.");

    if (role === "teacher" && !userId.trim())
      errs.push("Teacher code is required for teachers.");

    // Enrollment year basic sanity (allow current year +/- 6 for flexibility)
    const currentYear = new Date().getFullYear();
    if (role === "student") {
      if (!enrollmentYear || isNaN(enrollmentYear))
        errs.push("Enrollment year is invalid.");
      else if (
        enrollmentYear < currentYear - 6 ||
        enrollmentYear > currentYear + 1
      )
        errs.push("Enrollment year seems out of acceptable range.");
    }

    if (!tempPassword) errs.push("Temporary password is required.");
    else if (tempPassword.length < 6)
      errs.push("Temporary password must be at least 6 characters.");
    else {
      // Light complexity suggestion (optional)
      const hasLetter = /[A-Za-z]/.test(tempPassword);
      const hasNumber = /[0-9]/.test(tempPassword);
      if (!(hasLetter && hasNumber)) {
        errs.push(
          "Temporary password should include letters and numbers for security."
        );
      }
    }

    if (!adminPassword) errs.push("Admin password confirmation is required.");

    if (phone && !/^\+?[0-9]{7,15}$/.test(phone))
      errs.push(
        "Phone number format is invalid (digits only, 7-15 length, optional +)."
      );

    return errs;
  };

  const showPhotoOptions = () => {
    Alert.alert(
      "📸 Add Photo",
      "Choose how you'd like to add a profile photo for the new user:",
      [
        {
          text: "📷 Take Photo",
          onPress: handleTakePhoto,
          style: "default",
        },
        {
          text: "🖼️ Choose from Gallery",
          onPress: handleSelectPhoto,
          style: "default",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          "📷 Camera Permission Required",
          "Please allow camera access in your device settings to take photos.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => ImagePicker.requestCameraPermissionsAsync(),
            },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets?.length) {
        setNewUser({ ...newUser, photoUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Camera Error", "Failed to access camera. Please try again.");
    }
  };

  const handleSelectPhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          "🖼️ Photo Library Permission Required",
          "Please allow photo library access in your device settings to select photos.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
            },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets?.length) {
        setNewUser({ ...newUser, photoUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert(
        "Gallery Error",
        "Failed to access photo library. Please try again."
      );
    }
  };

  async function uploadPhotoToSupabase(uri: string | null) {
    if (!uri) return null; // no photo chosen, that's fine
    const filename = `${newUser.role}-${uuid.v4()}.jpg`;
    try {
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error } = await supabase.storage
        .from("student-photos")
        .upload(filename, arrayBuffer, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error("Failed to upload photo. Please try again.");
      }

      const publicUrl = supabase.storage
        .from("student-photos")
        .getPublicUrl(filename).data.publicUrl;
      if (!publicUrl) throw new Error("Could not obtain public photo URL.");
      return publicUrl;
    } catch (err: any) {
      console.error("uploadPhotoToSupabase error:", err);
      throw err;
    }
  }

  const handleAddUser = async () => {
    // 1) Local validations
    const validationErrors = validateNewUser();
    if (validationErrors.length) {
      Alert.alert("Validation Errors", validationErrors.join("\n"));
      return;
    }

    setLoading(true);
    try {
      // 2) Ensure current session (admin) & capture email early
      const { data: sessionData } = await supabase.auth.getSession();
      const adminSession = (sessionData as any)?.session;
      if (!adminSession) {
        Alert.alert("Not signed in", "Please sign in as admin to add users.");
        return;
      }
      const adminEmail = adminSession.user?.email;
      if (!adminEmail) {
        Alert.alert("Error", "Can't determine admin email from session.");
        return;
      }

      // 3) Pre-empt uniqueness (email in existing profile tables & teacher_code)
      // NOTE: This does NOT guarantee uniqueness in auth.users. True atomic user creation
      // should be implemented via a backend Edge Function with service role.
      const emailLower = newUser.email.toLowerCase();
      const { data: existingStudent, error: studentEmailErr } = await supabase
        .from("students")
        .select("id")
        .eq("email", emailLower)
        .maybeSingle();
      if (studentEmailErr)
        console.warn("students email lookup error", studentEmailErr);
      const { data: existingTeacher, error: teacherEmailErr } = await supabase
        .from("teachers")
        .select("id")
        .eq("email", emailLower)
        .maybeSingle();
      if (teacherEmailErr)
        console.warn("teachers email lookup error", teacherEmailErr);
      if (existingStudent || existingTeacher) {
        Alert.alert(
          "Duplicate Email",
          "A profile with this email already exists."
        );
        return;
      }

      if (newUser.role === "teacher" && newUser.userId) {
        const { data: teacherCodeRow, error: teacherCodeErr } = await supabase
          .from("teachers")
          .select("id")
          .eq("teacher_code", newUser.userId)
          .maybeSingle();
        if (teacherCodeErr)
          console.warn("teacher code lookup error", teacherCodeErr);
        if (teacherCodeRow) {
          Alert.alert(
            "Duplicate Teacher Code",
            "That teacher code is already in use."
          );
          return;
        }
      }

      // 4) Upload photo (if selected) BEFORE user creation, treat failure as blocking
      let photo_url: string | null = null;
      if (newUser.photoUri) {
        try {
          photo_url = await uploadPhotoToSupabase(newUser.photoUri);
        } catch (uploadErr: any) {
          Alert.alert(
            "Photo Upload Failed",
            uploadErr?.message || "Could not upload photo."
          );
          return; // abort completely -> NO auth user created
        }
      }

      // 5) Only NOW create the auth user (last potential failing step before profile insert)
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
          "Auth Error",
          signUpErr.message || "Failed to create auth user."
        );
        return; // abort (no profile insert attempted)
      }

      const createdUserId =
        (signUpData as any)?.user?.id || (signUpData as any)?.id;
      if (!createdUserId) {
        Alert.alert(
          "Warning",
          "User created but user id missing in response. Profile not inserted."
        );
        return;
      }

      // 6) Re-auth as admin to insert profile row (restore admin session)
      const { error: signInBackErr } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: newUser.adminPassword,
      });
      if (signInBackErr) {
        console.error("Failed to sign back in as admin", signInBackErr);
        Alert.alert(
          "Session Error",
          "Auth user created but failed to restore admin session."
        );
        // At this point we cannot roll back the auth user (requires service role). Inform admin.
        return;
      }

      // 7) Insert profile row
      const profilePayload: any = {
        auth_user_id: createdUserId,
        full_name: newUser.name,
        email: emailLower,
        phone: newUser.phone || null,
        department: newUser.department,
        photo_url: photo_url,
        is_active: true,
      };
      if (newUser.role === "student")
        profilePayload.enrollment_year = newUser.enrollmentYear;
      if (newUser.role === "teacher" && newUser.userId)
        profilePayload.teacher_code = newUser.userId;

      const tableName = newUser.role === "student" ? "students" : "teachers";
      const { error: insertErr } = await supabase
        .from(tableName)
        .insert([profilePayload]);
      if (insertErr) {
        console.error("Profile insert error", insertErr);
        Alert.alert(
          "Profile Error",
          "Auth user created but profile insertion failed. Please fix manually."
        );
        return; // Cannot rollback auth user client-side
      }

      Alert.alert("Success", `${newUser.role} ${newUser.name} added.`);
      await refreshUser();
      onCreated?.({ auth_user_id: createdUserId });
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unexpected error creating user.");
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
                <MaterialIcons name="person-add" size={28} color="#3B82F6" />
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
                  <FontAwesome
                    name={newUser.role === "teacher" ? "user" : "user-o"}
                    size={24}
                    color={newUser.role === "teacher" ? "#fff" : "#4B5563"}
                  />
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
                  <FontAwesome
                    name="graduation-cap"
                    size={24}
                    color={newUser.role === "student" ? "#fff" : "#4B5563"}
                  />
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
              <Text className="text-base font-semibold text-gray-700 mb-3">
                Profile Photo
              </Text>
              {newUser.photoUri ? (
                <View className="items-center">
                  <View className="relative">
                    <Image
                      source={{ uri: newUser.photoUri }}
                      className="w-24 h-24 rounded-full border-4 border-blue-100 shadow-sm"
                    />
                    <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-2 border-white justify-center items-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  </View>
                  <View className="flex-row gap-2 mt-3">
                    <TouchableOpacity
                      onPress={showPhotoOptions}
                      className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-200 flex-row items-center"
                    >
                      <Text className="text-blue-600 font-medium text-sm">
                        Change
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setNewUser({ ...newUser, photoUri: null })}
                      className="px-4 py-2 bg-red-50 rounded-xl border border-red-200 flex-row items-center"
                    >
                      <Text className="text-red-600 font-medium text-sm">
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={showPhotoOptions}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 border-dashed justify-center items-center shadow-sm active:scale-95"
                  style={{
                    transform: [{ scale: 1 }],
                    shadowColor: "#3B82F6",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }}
                >
                  <View className="items-center">
                    <MaterialIcons
                      name="add-a-photo"
                      size={30}
                      color="#3B82F6"
                    />
                    <Text className="text-xs text-blue-500 font-medium text-center px-2">
                      Add Photo
                    </Text>
                  </View>
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
