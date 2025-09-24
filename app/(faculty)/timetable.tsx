import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { MOCK_CLASSES, WEEKDAYS, Weekday, getTodayAbbrev } from "../../utils/schedule";

export default function TimetableTab() {
  const [day, setDay] = useState<Weekday>(getTodayAbbrev());
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  
  // Form states for Add Class
  const [newClass, setNewClass] = useState({
    subject: "",
    semester: "",
    section: "",
    roomNumber: "",
    startTime: "",
    endTime: "",
    totalStudents: "",
  });

  useEffect(() => {
    // When component mounts, ensure default day reflects today
    setDay(getTodayAbbrev());
  }, []);

  const slots = MOCK_CLASSES[day];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      {/* Header Section */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 mb-1">My Timetable</Text>
            <Text className="text-sm text-gray-600">
              Weekly class schedule • {getTodayAbbrev()} is today
            </Text>
          </View>
          <View className="bg-blue-50 rounded-full p-3">
            <MaterialIcons name="schedule" size={24} color="#3b82f6" />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Weekly Overview Stats */}
        <View className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 mb-6 shadow-sm">
          <Text className="text-white text-lg font-semibold mb-3">This Week Overview</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                {Object.values(MOCK_CLASSES).reduce((total, dayClasses) => total + dayClasses.length, 0)}
              </Text>
              <Text className="text-blue-100 text-xs">Total Classes</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                {MOCK_CLASSES[getTodayAbbrev()]?.length || 0}
              </Text>
              <Text className="text-blue-100 text-xs">Classes Today</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                {Object.keys(MOCK_CLASSES).filter(day => MOCK_CLASSES[day as Weekday].length > 0).length}
              </Text>
              <Text className="text-blue-100 text-xs">Active Days</Text>
            </View>
          </View>
        </View>

        {/* Day selector */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Select Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {WEEKDAYS.map((d) => {
                const isToday = d === getTodayAbbrev();
                const isSelected = d === day;
                const classCount = MOCK_CLASSES[d as Weekday]?.length || 0;
                
                return (
                  <TouchableOpacity
                    key={d}
                    className={`mr-3 px-5 py-4 rounded-2xl border-2 min-w-[80px] items-center ${
                      isSelected 
                        ? "bg-blue-600 border-blue-600" 
                        : isToday 
                        ? "bg-blue-50 border-blue-200" 
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() => setDay(d as Weekday)}
                  >
                    <Text className={`font-bold text-sm ${
                      isSelected ? "text-white" : isToday ? "text-blue-600" : "text-gray-700"
                    }`}>
                      {d}
                    </Text>
                    {isToday && !isSelected && (
                      <View className="w-2 h-2 bg-blue-600 rounded-full mt-1" />
                    )}
                    <Text className={`text-xs mt-1 ${
                      isSelected ? "text-blue-100" : isToday ? "text-blue-500" : "text-gray-500"
                    }`}>
                      {classCount} {classCount === 1 ? 'class' : 'classes'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Selected Day Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-semibold text-gray-900">
            {day} Schedule
          </Text>
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-sm font-medium text-gray-600">
              {slots.length} {slots.length === 1 ? 'Class' : 'Classes'}
            </Text>
          </View>
        </View>

        {/* Slots */}
        {slots.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 shadow-sm items-center border border-gray-100">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="event-busy" size={32} color="#9ca3af" />
            </View>
            <Text className="text-lg font-semibold text-gray-500 mb-2">No classes scheduled</Text>
            <Text className="text-sm text-gray-400 text-center">
              Enjoy your free day! Use this time to prepare for upcoming classes.
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {slots.map((s, idx) => {
              const timeSlots = s.scheduleTime.split(' - ');
              const startTime = timeSlots[0];
              const endTime = timeSlots[1];
              
              return (
                <View key={`${day}-${idx}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 mr-3">
                      <Text className="text-lg font-bold text-gray-900 mb-1">{s.subject}</Text>
                      <View className="flex-row items-center mb-2">
                        <MaterialIcons name="school" size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-1">
                          {s.semester} Semester • Section {s.section}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialIcons name="room" size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-1">Room {s.roomNumber}</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <View className="bg-blue-50 px-3 py-2 rounded-lg">
                        <Text className="text-blue-600 font-bold text-sm">{startTime}</Text>
                        <Text className="text-blue-500 text-xs text-center">to</Text>
                        <Text className="text-blue-600 font-bold text-sm">{endTime}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Quick Actions */}
        <View className="mt-8 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="flex-1 bg-green-50 border border-green-200 rounded-xl p-4 mr-2 items-center"
              onPress={() => setShowAddClassModal(true)}
            >
              <MaterialIcons name="schedule" size={24} color="#059669" />
              <Text className="text-green-700 font-medium mt-2 text-sm">Add Class</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 bg-orange-50 border border-orange-200 rounded-xl p-4 ml-2 items-center"
              onPress={() => setShowEditScheduleModal(true)}
            >
              <MaterialIcons name="edit-calendar" size={24} color="#ea580c" />
              <Text className="text-orange-700 font-medium mt-2 text-sm">Edit Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Add Class Modal */}
      <Modal
        visible={showAddClassModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddClassModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-900">Add New Class</Text>
              <TouchableOpacity onPress={() => setShowAddClassModal(false)}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Subject Name</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900"
                    placeholder="Enter subject name"
                    value={newClass.subject}
                    onChangeText={(text) => setNewClass({...newClass, subject: text})}
                  />
                </View>
                
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Semester</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900"
                      placeholder="e.g., 5th"
                      value={newClass.semester}
                      onChangeText={(text) => setNewClass({...newClass, semester: text})}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Section</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900"
                      placeholder="e.g., A"
                      value={newClass.section}
                      onChangeText={(text) => setNewClass({...newClass, section: text})}
                    />
                  </View>
                </View>
                
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Room Number</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900"
                    placeholder="e.g., CS-205"
                    value={newClass.roomNumber}
                    onChangeText={(text) => setNewClass({...newClass, roomNumber: text})}
                  />
                </View>
                
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Start Time</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900"
                      placeholder="09:30"
                      value={newClass.startTime}
                      onChangeText={(text) => setNewClass({...newClass, startTime: text})}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">End Time</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900"
                      placeholder="10:30"
                      value={newClass.endTime}
                      onChangeText={(text) => setNewClass({...newClass, endTime: text})}
                    />
                  </View>
                </View>
                
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Total Students</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900"
                    placeholder="e.g., 45"
                    keyboardType="numeric"
                    value={newClass.totalStudents}
                    onChangeText={(text) => setNewClass({...newClass, totalStudents: text})}
                  />
                </View>
              </View>
              
              <View className="flex-row justify-between mt-6">
                <TouchableOpacity 
                  className="flex-1 bg-gray-200 py-3 px-4 rounded-lg mr-2"
                  onPress={() => {
                    setShowAddClassModal(false);
                    setNewClass({
                      subject: "",
                      semester: "",
                      section: "",
                      roomNumber: "",
                      startTime: "",
                      endTime: "",
                      totalStudents: "",
                    });
                  }}
                >
                  <Text className="text-gray-700 font-medium text-center">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-1 bg-green-600 py-3 px-4 rounded-lg ml-2"
                  onPress={() => {
                    // Here you would normally save to database
                    Alert.alert("Success", "New class added successfully!");
                    setShowAddClassModal(false);
                    setNewClass({
                      subject: "",
                      semester: "",
                      section: "",
                      roomNumber: "",
                      startTime: "",
                      endTime: "",
                      totalStudents: "",
                    });
                  }}
                >
                  <Text className="text-white font-medium text-center">Add Class</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Schedule Modal */}
      <Modal
        visible={showEditScheduleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditScheduleModal(false)}
      >
        <View className="flex-1 justify-center bg-black/50 p-4">
          <View className="bg-white rounded-2xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-900">Edit Schedule</Text>
              <TouchableOpacity onPress={() => setShowEditScheduleModal(false)}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-gray-600 mb-6 text-center">
              Choose what you'd like to edit in your schedule
            </Text>
            
            <View className="space-y-3">
              <TouchableOpacity 
                className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row items-center"
                onPress={() => {
                  setShowEditScheduleModal(false);
                  Alert.alert("Edit Class", "This will open the class editor for modification.");
                }}
              >
                <MaterialIcons name="edit" size={24} color="#3b82f6" />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-gray-900">Edit Existing Classes</Text>
                  <Text className="text-sm text-gray-600">Modify time, room, or details</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row items-center"
                onPress={() => {
                  setShowEditScheduleModal(false);
                  Alert.alert(
                    "Delete Class",
                    "Are you sure you want to delete this class?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => Alert.alert("Success", "Class deleted successfully!") }
                    ]
                  );
                }}
              >
                <MaterialIcons name="delete" size={24} color="#ef4444" />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-gray-900">Delete Classes</Text>
                  <Text className="text-sm text-gray-600">Remove classes from schedule</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex-row items-center"
                onPress={() => {
                  setShowEditScheduleModal(false);
                  Alert.alert("Bulk Edit", "This will open bulk editing options for your schedule.");
                }}
              >
                <MaterialIcons name="swap-horiz" size={24} color="#8b5cf6" />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-gray-900">Bulk Edit</Text>
                  <Text className="text-sm text-gray-600">Move or reschedule multiple classes</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              className="bg-gray-200 py-3 px-4 rounded-lg mt-6"
              onPress={() => setShowEditScheduleModal(false)}
            >
              <Text className="text-gray-700 font-medium text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
