import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SubmissionAttachment {
  attachmentId: number;
  fileType: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
}

export interface HomeworkSubmission {
  submissionId: number;
  assignmentId: number;
  studentId: number;
  textCaption: string | null;
  status: 'SUBMITTED' | 'REVIEWED' | 'GRADED';
  submittedAt: string;
  reviewedAt: string | null;
  attachments: SubmissionAttachment[];
}

export interface DoubtAttachment {
  attachmentId: number;
  fileType: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
}

export interface DoubtMessageItem {
  doubtMessageId: number;
  threadId: number;
  senderId: number;
  senderRole: 'STUDENT' | 'TEACHER';
  textBody: string | null;
  sentAt: string;
  attachments: DoubtAttachment[];
}

export interface DoubtThread {
  threadId: number;
  studentId: number;
  teacherId: number;
  teacherName: string;
  subjectId: number | null;
  subjectName: string | null;
  chapterId: number | null;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  resolvedAt: string | null;
  messages: DoubtMessageItem[];
}

@Injectable({ providedIn: 'root' })
export class StudentSubmissionApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/v1/student-portal`;

  submit(assignmentId: number, formData: FormData): Observable<HomeworkSubmission> {
    const params = new HttpParams().set('assignmentId', assignmentId.toString());
    return this.http.post<HomeworkSubmission>(`${this.base}/submissions`, formData, { params });
  }

  getStatus(assignmentId: number): Observable<HomeworkSubmission> {
    const params = new HttpParams().set('assignmentId', assignmentId.toString());
    return this.http.get<HomeworkSubmission>(`${this.base}/submissions/status`, { params });
  }

  openDoubtThread(fd: FormData, subjectId?: number, chapterId?: number): Observable<DoubtThread> {
    let params = new HttpParams();
    if (subjectId != null) params = params.set('subjectId', subjectId.toString());
    if (chapterId != null) params = params.set('chapterId', chapterId.toString());
    return this.http.post<DoubtThread>(`${this.base}/doubts`, fd, { params });
  }

  replyToThread(threadId: number, fd: FormData): Observable<DoubtMessageItem> {
    return this.http.post<DoubtMessageItem>(`${this.base}/doubts/${threadId}/reply`, fd);
  }

  resolveThread(threadId: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/doubts/${threadId}/resolve`, {});
  }

  listDoubtThreads(): Observable<DoubtThread[]> {
    return this.http.get<DoubtThread[]>(`${this.base}/doubts`);
  }

  getDoubtThread(threadId: number | string): Observable<DoubtThread> {
    return this.http.get<DoubtThread>(`${this.base}/doubts/${threadId}`);
  }
}
