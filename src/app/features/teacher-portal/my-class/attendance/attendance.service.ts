import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  AttendanceMarkRequest,
  AttendanceMarkResponse,
  AttendanceRecord
} from '../../shared/models/teacher-portal.models';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/v1/teacher-portal/attendance`;

  getByClassAndDate(classId: string, date: string, classLabel?: string): Observable<AttendanceRecord[]> {
    const params: Record<string, string> = { date };
    if (classLabel) params['classLabel'] = classLabel;
    return this.http.get<AttendanceRecord[]>(`${this.base}/${classId}`, { params });
  }

  mark(req: AttendanceMarkRequest): Observable<AttendanceMarkResponse> {
    return this.http.post<AttendanceMarkResponse>(`${this.base}/mark`, req);
  }

  update(req: AttendanceMarkRequest): Observable<AttendanceMarkResponse> {
    return this.http.put<AttendanceMarkResponse>(`${this.base}/update`, req);
  }
}
