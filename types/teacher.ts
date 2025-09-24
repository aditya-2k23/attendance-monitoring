export interface TeacherClass {
  id: string;
  subject: string;
  department: string;
  semester: string;
  section: string;
  totalStudents: number;
  scheduleTime: string;
  roomNumber: string;
  dayOfWeek: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string;
  presentStudents: number;
  totalStudents: number;
  attendanceRate: number;
  subject: string;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  department: string;
  semester: string;
  section: string;
  attendanceRate: number;
  isPresent?: boolean;
}

export interface TodaySchedule {
  id: string;
  subject: string;
  time: string;
  duration: number;
  roomNumber: string;
  semester: string;
  section: string;
  totalStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'missed';
}

export interface TeacherStats {
  totalClasses: number;
  classesToday: number;
  studentsPresent: number;
  totalStudents: number;
  averageAttendance: number;
  completedClasses: number;
  pendingClasses: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: string;
  credits: number;
  totalLectures: number;
  completedLectures: number;
  averageAttendance: number;
}