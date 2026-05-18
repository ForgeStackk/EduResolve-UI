export interface TeacherClass {
  classId: string;
  className: string;
  section: string;
  isClassTeacher: boolean;
}

export interface TeacherSubject {
  subjectId: number;
  subjectName: string;
}

export interface StudentRow {
  studentId: string;
  fullName: string;
  rollNumber: string;
  parentName: string | null;
  parentPhone: string | null;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'HOLIDAY';

export interface AttendanceRecord {
  studentId: string;
  fullName: string;
  rollNumber: string;
  status: AttendanceStatus | null;
  remarks: string | null;
}

export interface AttendanceMarkRequest {
  classId: string;
  date: string;
  records: { studentId: string; status: AttendanceStatus; remarks?: string }[];
}

export interface AttendanceMarkResponse {
  saved: boolean;
  count: number;
}

export interface StudentAttendanceSummary {
  studentId: string;
  rollNumber?: string;
  fullName: string;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  holiday: number;
}

export interface AttendanceSummary {
  totalWorkingDays: number;
  /** Working days in the full calendar month (present even for partial reports). */
  projectedWorkingDays?: number;
  studentWiseSummary: StudentAttendanceSummary[];
}

export interface AttendanceReport {
  reportId: string;
  reportFileUrl: string | null;
  summary: AttendanceSummary;
  /** ISO date string of the first day included in this report. */
  fromDate?: string;
  /** ISO date string of the last day included in this report. */
  toDate?: string;
  /** True when the report covers a month that has not yet ended. */
  isPartial?: boolean;
}

export type RecipientType = 'CLASS' | 'ABSENT_GUARDIANS' | 'INDIVIDUAL_STUDENT' | 'INDIVIDUAL_PARENT';
export type MessageContentType = 'TEXT' | 'VOICE' | 'IMAGE' | 'FILE' | 'MIXED';

export interface SendMessageResponse {
  messageId: string;
  sentAt: string;
  deliveredTo: number;
}

export interface MessageSummary {
  messageId: string;
  recipientType: RecipientType;
  targetClassId: string;
  textBody: string | null;
  contentType: MessageContentType;
  sentAt: string;
  isHomework: boolean;
  homeworkDueDate: string | null;
  attachmentCount: number;
  readCount: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
