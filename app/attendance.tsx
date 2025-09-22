import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mock data for today's classes
const todaysClasses = [
  {
    id: 1,
    subject: "Physics",
    chapter: "Chapter 4 - Force",
    time: "09:30 - 10:30",
    room: "Room 101",
    totalStudents: 45,
    presentStudents: 42,
    status: "ongoing",
  },
  {
    id: 2,
    subject: "Mathematics",
    chapter: "Calculus - Derivatives",
    time: "11:00 - 12:00",
    room: "Room 205",
    totalStudents: 38,
    presentStudents: 35,
    status: "upcoming",
  },
  {
    id: 3,
    subject: "Chemistry",
    chapter: "Organic Chemistry",
    time: "01:30 - 02:30",
    room: "Lab 103",
    totalStudents: 40,
    presentStudents: 40,
    status: "completed",
  },
  {
    id: 4,
    subject: "Biology",
    chapter: "Cell Structure",
    time: "03:00 - 04:00",
    room: "Room 301",
    totalStudents: 42,
    presentStudents: 39,
    status: "completed",
  },
];

export default function AttendancePage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lecture Attendance</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Date and Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.dateText}>Today, September 22, 2025</Text>
        <Text style={styles.summaryText}>
          {todaysClasses.length} Classes •{" "}
          {todaysClasses.filter((c) => c.status === "completed").length}{" "}
          Completed
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Classes List */}
        <View style={styles.classesList}>
          {todaysClasses.map((classItem) => (
            <TouchableOpacity
              key={classItem.id}
              style={[
                styles.classCard,
                selectedClass === classItem.id && styles.selectedClassCard,
              ]}
              onPress={() =>
                setSelectedClass(
                  selectedClass === classItem.id ? null : classItem.id
                )
              }
            >
              <View style={styles.classHeader}>
                <View style={styles.classInfo}>
                  <Text style={styles.subjectName}>{classItem.subject}</Text>
                  <Text style={styles.chapterName}>{classItem.chapter}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(classItem.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(classItem.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.classDetails}>
                <View style={styles.timeAndRoom}>
                  <Text style={styles.timeText}>{classItem.time}</Text>
                  <Text style={styles.roomText}>{classItem.room}</Text>
                </View>

                <View style={styles.attendanceInfo}>
                  <Text style={styles.attendanceText}>
                    {classItem.presentStudents}/{classItem.totalStudents}{" "}
                    Present
                  </Text>
                  <Text
                    style={[
                      styles.percentageText,
                      {
                        color:
                          calculateAttendancePercentage(
                            classItem.presentStudents,
                            classItem.totalStudents
                          ) >= 80
                            ? "#4caf50"
                            : "#ff5722",
                      },
                    ]}
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
                <View style={styles.expandedDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Absent Students:</Text>
                    <Text style={styles.detailValue}>
                      {classItem.totalStudents - classItem.presentStudents}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Attendance Rate:</Text>
                    <Text style={styles.detailValue}>
                      {calculateAttendancePercentage(
                        classItem.presentStudents,
                        classItem.totalStudents
                      )}
                      %
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.primaryButton]}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          styles.primaryButtonText,
                        ]}
                      >
                        Mark Attendance
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryStats}>
          <Text style={styles.statsTitle}>Today&apos;s Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {todaysClasses.reduce((sum, c) => sum + c.presentStudents, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {todaysClasses.reduce((sum, c) => sum + c.totalStudents, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
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
              <Text style={styles.statLabel}>Overall Rate</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    color: "#333",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  headerRight: {
    width: 40,
  },
  summaryContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  classesList: {
    marginBottom: 30,
  },
  classCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedClassCard: {
    borderWidth: 2,
    borderColor: "#007bff",
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  classInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  chapterName: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  classDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeAndRoom: {
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  roomText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  attendanceInfo: {
    alignItems: "flex-end",
  },
  attendanceText: {
    fontSize: 14,
    color: "#666",
  },
  percentageText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007bff",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#007bff",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "500",
  },
  primaryButtonText: {
    color: "white",
  },
  summaryStats: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
