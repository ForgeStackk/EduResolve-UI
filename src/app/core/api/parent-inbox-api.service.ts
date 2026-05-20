import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AttendanceDayDto, StudentInboxItem } from './student-inbox-api.service';

export type { AttendanceDayDto, StudentInboxItem };

@Injectable({ providedIn: 'root' })
export class ParentInboxApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/v1/parent-portal`;

  getInbox(page = 0, size = 50): Observable<StudentInboxItem[]> {
    return this.http.get<StudentInboxItem[]>(`${this.base}/inbox`, { params: { page, size } });
  }

  markRead(inboxId: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/inbox/${inboxId}/read`, {});
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/inbox/unread-count`);
  }

  getAttendance(month: number, year: number, childId?: string): Observable<AttendanceDayDto[]> {
    const params: Record<string, string | number> = { month, year };
    if (childId) params['childId'] = childId;
    return this.http.get<AttendanceDayDto[]>(`${this.base}/attendance`, { params });
  }
}
