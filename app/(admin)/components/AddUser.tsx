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
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `${newUser.role}-${uuid.v4()}.jpg`;
      const { error } = await supabase.storage
        .from("user-photos") // ensure this bucket exists
        .upload(filename, blob, { upsert: true });

      if (error) {
        console.error("Supabase upload error:", error);
        return null;
      }

      // If bucket is public:
      const publicUrl = supabase.storage
        .from("user-photos")
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
            emailRedirectTo: undefined, // Disable email verification
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
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 18,
              width: "92%",
              maxWidth: 480,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
              Add New User
            </Text>

            {/* Photo */}
            <View style={{ alignItems: "center", marginBottom: 12 }}>
              {newUser.photoUri ? (
                <Image
                  source={{ uri: newUser.photoUri }}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    marginBottom: 8,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: "#E5E7EB",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>📷</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={showPhotoOptions}
                style={{
                  padding: 8,
                  backgroundColor: "#EFF6FF",
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#1D4ED8", fontWeight: "600" }}>
                  {newUser.photoUri ? "Change Photo" : "Add Photo"}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Full Name *"
              value={newUser.name}
              onChangeText={(t) => setNewUser({ ...newUser, name: t })}
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 10,
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
            <TextInput
              placeholder="Email Address *"
              value={newUser.email}
              onChangeText={(t) => setNewUser({ ...newUser, email: t })}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 10,
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
            <TextInput
              placeholder="Phone Number"
              value={newUser.phone}
              onChangeText={(t) => setNewUser({ ...newUser, phone: t })}
              keyboardType="phone-pad"
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 10,
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
            {newUser.role === "teacher" && (
              <TextInput
                placeholder="Teacher Code *"
                value={newUser.userId}
                onChangeText={(t) => setNewUser({ ...newUser, userId: t })}
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            )}
            {newUser.role === "student" && (
              <TextInput
                placeholder="Enrollment Year"
                value={newUser.enrollmentYear.toString()}
                onChangeText={(t) =>
                  setNewUser({
                    ...newUser,
                    enrollmentYear: parseInt(t) || new Date().getFullYear(),
                  })
                }
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            )}
            <TextInput
              placeholder="Department *"
              value={newUser.department}
              onChangeText={(t) => setNewUser({ ...newUser, department: t })}
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 10,
                borderRadius: 8,
                marginBottom: 8,
              }}
            />

            <TextInput
              placeholder="Temporary Password (for new user) *"
              value={newUser.tempPassword}
              onChangeText={(t) => setNewUser({ ...newUser, tempPassword: t })}
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 10,
                borderRadius: 8,
                marginBottom: 8,
              }}
            />

            <TextInput
              placeholder="Your admin password (confirm) *"
              value={newUser.adminPassword}
              onChangeText={(t) => setNewUser({ ...newUser, adminPassword: t })}
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 10,
                borderRadius: 8,
                marginBottom: 8,
              }}
            />

            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => setNewUser({ ...newUser, role: "teacher" })}
                style={{
                  flex: 1,
                  padding: 10,
                  marginRight: 6,
                  backgroundColor:
                    newUser.role === "teacher" ? "#2563EB" : "#E5E7EB",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: newUser.role === "teacher" ? "white" : "#374151",
                    fontWeight: "600",
                  }}
                >
                  Teacher
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setNewUser({ ...newUser, role: "student" })}
                style={{
                  flex: 1,
                  padding: 10,
                  marginLeft: 6,
                  backgroundColor:
                    newUser.role === "student" ? "#2563EB" : "#E5E7EB",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: newUser.role === "student" ? "white" : "#374151",
                    fontWeight: "600",
                  }}
                >
                  Student
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  onClose();
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#E5E7EB",
                  padding: 12,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "#374151",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddUser}
                style={{
                  flex: 1,
                  backgroundColor: "#2563EB",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "600",
                    }}
                  >
                    Add User
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
