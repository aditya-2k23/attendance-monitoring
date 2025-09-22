import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Greeting Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Hello Teacher</Text>
            <Text style={styles.taskText}>
              You&apos;ve got{" "}
              <Text style={styles.taskHighlight}>4 lectures</Text> today!
            </Text>
          </View>
          <View style={styles.profileContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileInitial}>D</Text>
            </View>
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Today&apos;s Classes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Students Present</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>Your running subjects</Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#ff6b8a" }]}
            >
              <Text style={styles.actionCardTitle}>Today&apos;s Classes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#e91e63" }]}
              onPress={() => router.push("/attendance")}
            >
              <Text style={styles.actionCardTitle}>Lecture Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#3f51b5" }]}
            >
              <Text style={styles.actionCardTitle}>Track Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Schedule */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your schedule</Text>
          <Text style={styles.sectionSubtitle}>Upcoming classes and tasks</Text>

          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.scheduleSubject}>Physics</Text>
              <Text style={styles.scheduleChapter}>Chapter: 4 - Force</Text>
            </View>
            <View style={styles.scheduleDetails}>
              <View style={styles.scheduleTime}>
                <Text style={styles.timeLabel}>09:30</Text>
                <Text style={styles.timeSubtext}>Max. three</Text>
              </View>
              <Text style={styles.roomInfo}>Hall room name</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconActive} />
          <Text style={styles.navLabelActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon} />
          <Text style={styles.navLabel}>Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon} />
          <Text style={styles.navLabel}>Classroom</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon} />
          <Text style={styles.navLabel}>Messages</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for bottom navigation
  },
  // Header styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  taskText: {
    fontSize: 14,
    color: "#666",
  },
  taskHighlight: {
    color: "#007bff",
    fontWeight: "600",
  },
  profileContainer: {
    position: "relative",
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ff4757",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  // Statistics Cards
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  // Section styles
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    height: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
  actionCardTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  // Schedule styles
  scheduleCard: {
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
  scheduleHeader: {
    marginBottom: 16,
  },
  scheduleSubject: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  scheduleChapter: {
    fontSize: 14,
    color: "#666",
  },
  scheduleDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleTime: {
    alignItems: "flex-start",
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  timeSubtext: {
    fontSize: 12,
    color: "#666",
  },
  roomInfo: {
    fontSize: 14,
    color: "#666",
  },
  // Bottom Navigation
  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  navItem: {
    alignItems: "center",
    flex: 1,
  },
  navIcon: {
    width: 24,
    height: 24,
    backgroundColor: "#ccc",
    borderRadius: 12,
    marginBottom: 4,
  },
  navIconActive: {
    width: 24,
    height: 24,
    backgroundColor: "#007bff",
    borderRadius: 12,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: "#666",
  },
  navLabelActive: {
    fontSize: 12,
    color: "#007bff",
    fontWeight: "600",
  },
});
