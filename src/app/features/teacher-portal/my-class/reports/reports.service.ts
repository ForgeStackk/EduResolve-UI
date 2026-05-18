import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AttendanceReport } from '../../shared/models/teacher-portal.models';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/v1/teacher-portal/attendance`;

  generate(classId: string, month: number, year: number): Observable<AttendanceReport> {
    return this.http.post<AttendanceReport>(
      `${this.base}/report/generate`,
      { classId, month, year }
    );
  }

  get(classId: string, month: number, year: number): Observable<AttendanceReport> {
    return this.http.get<AttendanceReport>(`${this.base}/report/${classId}`, {
      params: { month: month.toString(), year: year.toString() }
    });
  }

  send(reportId: string, sendTo: string[]): Observable<void> {
    return this.http.post<void>(`${this.base}/report/${reportId}/send`, { sendTo });
  }
}
