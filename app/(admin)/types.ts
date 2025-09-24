export interface User {
  id: number;
  name: string;
  email: string;
  userId: string; // student/teacher ID
  role: "teacher" | "student";
  department?: string;
  courses?: string[];
  photoUri?: string; // photo URI
  status: "active" | "inactive";
}

export interface AttendanceStats {
  department: string;
  totalStudents: number;
  presentToday: number;
  averageRate: number;
  atRiskCount: number;
}

export interface FacultyPerformance {
  teacherId: number;
  name: string;
  scheduledClasses: number;
  conductedClasses: number;
  missedClasses: number;
  performanceRate: number;
}
