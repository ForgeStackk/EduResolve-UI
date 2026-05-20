import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type MessageCategory = 'ABSENCE_NOTIFICATION' | 'CLASS_NOTICE' | 'SUBJECT_MESSAGE' | 'HOMEWORK';
export type ReadStatus = 'READ' | 'UNREAD';

export interface AttachmentInfo {
  attachmentId: string;
  fileType: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
}

export interface StudentInboxItem {
  inboxId: string;
  messageId: string;
  senderName: string;
  category: MessageCategory;
  targetSubjectId: number | null;
  subjectName: string | null;
  textBody: string | null;
  contentType: string;
  sentAt: string;
  isHomework: boolean;
  homeworkDueDate: string | null;
  readStatus: ReadStatus;
  attachments: AttachmentInfo[];
}

export interface AttendanceDayDto {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'HOLIDAY';
  remarks: string | null;
}

@Injectable({ providedIn: 'root' })
export class StudentInboxApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/v1/student-portal`;

  getInbox(page = 0, size = 50): Observable<StudentInboxItem[]> {
    return this.http.get<StudentInboxItem[]>(`${this.base}/inbox`, { params: { page, size } });
  }

  markRead(inboxId: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/inbox/${inboxId}/read`, {});
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/inbox/unread-count`);
  }

  getAttendance(month: number, year: number): Observable<AttendanceDayDto[]> {
    return this.http.get<AttendanceDayDto[]>(`${this.base}/attendance`, { params: { month, year } });
  }
}
