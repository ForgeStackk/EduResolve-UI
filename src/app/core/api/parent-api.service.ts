import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Fee } from './fee-api.service';

export interface ParentDashboardSummary {
  pendingFees: number;
  pendingHomework: number;
}

export interface SubjectPerformance {
  subjectName: string;
  colorHex: string;
  avgScore: number;
  topicCount: number;
}

export interface LeaveApplicationPayload {
  studentName: string;
  className: string;
  parentUserId: number;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface LeaveApplication {
  id: number;
  studentName: string;
  className: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
  createdAt: string;
}

export interface ChildProfile {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  relation: string;
  initials: string;
  color: string;
}

export interface AiConcernResponse {
  message: string;
  route: 'info' | 'ticket' | 'urgent';
  category: string;
  ticketCreated: boolean;
  ticketId: number | null;
}

export interface ParentTeacherMessage {
  id?: number;
  parentUserId: number;
  className: string;
  senderRole: 'parent' | 'teacher';
  senderName: string;
  body: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ParentApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/parent`;

  getDashboardSummary(userId: number | string): Observable<ParentDashboardSummary> {
    return this.http.get<ParentDashboardSummary>(`${this.base}/dashboard/summary`, { params: { userId: String(userId) } });
  }

  getPerformance(studentId: number | string): Observable<SubjectPerformance[]> {
    return this.http.get<SubjectPerformance[]>(`${this.base}/performance`, { params: { studentId: String(studentId) } });
  }

  submitLeaveApplication(body: LeaveApplicationPayload): Observable<LeaveApplication> {
    return this.http.post<LeaveApplication>(`${this.base}/leave-application`, body);
  }

  listLeaveApplications(userId: number | string): Observable<LeaveApplication[]> {
    return this.http.get<LeaveApplication[]>(`${this.base}/leave-application`, { params: { userId: String(userId) } });
  }

  getChildren(userId: number | string): Observable<ChildProfile[]> {
    return this.http.get<ChildProfile[]>(`${this.base}/children`, { params: { userId: String(userId) } });
  }

  submitAiConcern(concern: string, parentId: number | string, parentName: string): Observable<AiConcernResponse> {
    return this.http.post<AiConcernResponse>(`${this.base}/ai-concern`, { concern, parentId: Number(parentId), parentName });
  }

  getMessages(userId: number | string): Observable<ParentTeacherMessage[]> {
    return this.http.get<ParentTeacherMessage[]>(`${this.base}/messages`, { params: { userId: String(userId) } });
  }

  sendMessage(msg: ParentTeacherMessage): Observable<ParentTeacherMessage> {
    return this.http.post<ParentTeacherMessage>(`${this.base}/messages`, msg);
  }

  getAllFees(studentId: number | string): Observable<Fee[]> {
    return this.http.get<Fee[]>(`${this.base}/all-fees`, { params: { studentId: String(studentId) } });
  }
}
