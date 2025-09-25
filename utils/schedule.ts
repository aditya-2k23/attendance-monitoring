import { TeacherClass, TodaySchedule } from "../types/teacher";

// Weekday abbreviations used across the app (Mon-first, no Sunday in UI)
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export type Weekday = typeof WEEKDAYS[number];

// Map JS Date.getDay() to our Weekday (Sunday -> Mon by convention)
export function getTodayAbbrev(date: Date = new Date()): Weekday {
  const d = date.getDay(); // 0 Sun, 1 Mon, ... 6 Sat
  if (d === 0) return "Mon"; // No Sunday tab; default to Monday
  return WEEKDAYS[d - 1] as Weekday;
}

// Helper to parse "HH:MM" into minutes since midnight
function parseHM(hm: string): number {
  const [h, m] = hm.split(":").map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
}

// Helper to derive TodaySchedule.status using current time
function computeStatus(range: string, now: Date = new Date()): TodaySchedule["status"] {
  // Expect formats like "09:30 - 10:30"; fallback to start-only
  const [startPart, endPart] = range.split("-").map((s) => s.trim());
  const startM = parseHM(startPart);
  const endM = endPart ? parseHM(endPart) : startM + 60; // default 60 mins
  const minsNow = now.getHours() * 60 + now.getMinutes();
  if (minsNow < startM) return "upcoming";
  if (minsNow >= startM && minsNow < endM) return "ongoing";
  return "completed";
}

// Mock classes for the week. Replace with Supabase-backed data later.
export const MOCK_CLASSES: Record<Weekday, TeacherClass[]> = {
  Mon: [
    {
      id: "mon-1",
      subject: "Data Structures",
      department: "CSE",
      semester: "3rd",
      section: "A",
      totalStudents: 45,
      scheduleTime: "09:30 - 10:30",
      roomNumber: "CS-201",
      dayOfWeek: "Mon",
    },
    {
      id: "mon-2",
      subject: "Database Systems",
      department: "CSE",
      semester: "5th",
      section: "B",
      totalStudents: 40,
      scheduleTime: "11:30 - 12:30",
      roomNumber: "CS-204",
      dayOfWeek: "Mon",
    },
  ],
  Tue: [
    {
      id: "tue-1",
      subject: "Software Engineering",
      department: "CSE",
      semester: "6th",
      section: "A",
      totalStudents: 48,
      scheduleTime: "10:30 - 11:30",
      roomNumber: "CS-301",
      dayOfWeek: "Tue",
    },
  ],
  Wed: [
    {
      id: "wed-1",
      subject: "Computer Networks",
      department: "CSE",
      semester: "7th",
      section: "B",
      totalStudents: 42,
      scheduleTime: "09:30 - 10:30",
      roomNumber: "CS-205",
      dayOfWeek: "Wed",
    },
  ],
  Thu: [
    {
      id: "thu-1",
      subject: "Operating Systems",
      department: "CSE",
      semester: "4th",
      section: "A",
      totalStudents: 46,
      scheduleTime: "11:30 - 12:30",
      roomNumber: "CS-106",
      dayOfWeek: "Thu",
    },
  ],
  Fri: [
    {
      id: "fri-1",
      subject: "Algorithms",
      department: "CSE",
      semester: "5th",
      section: "A",
      totalStudents: 44,
      scheduleTime: "14:30 - 15:30",
      roomNumber: "CS-210",
      dayOfWeek: "Fri",
    },
  ],
  Sat: [],
};

// Derive today's schedule from mock classes and compute status
export function getTodaySchedule(now: Date = new Date()): TodaySchedule[] {
  const day = getTodayAbbrev(now);
  const classes = MOCK_CLASSES[day] || [];
  return classes.map((c): TodaySchedule => {
    const start = c.scheduleTime.split("-")[0]?.trim() || "";
    const status = computeStatus(c.scheduleTime, now);
    // Duration in minutes best-effort from time range
    const [s, e] = c.scheduleTime.split("-").map((s) => s.trim());
    const duration = e ? parseHM(e) - parseHM(s) : 60;
    return {
      id: c.id,
      subject: c.subject,
      time: start,
      duration,
      roomNumber: c.roomNumber,
      semester: c.semester,
      section: c.section,
      totalStudents: c.totalStudents,
      status,
    };
  });
}
