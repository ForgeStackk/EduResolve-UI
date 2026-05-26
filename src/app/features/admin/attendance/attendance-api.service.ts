import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface StudentAttendanceSummaryDto {
  studentId: number;
  name: string;
  rollNumber: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
  atRisk: boolean;
  trend: 'UP' | 'DOWN' | 'STABLE';
  dominantAbsenceReason: string | null;
}

export interface StudentDayRecordDto {
  date: string;
  status: string;
  reasonCode: string | null;
  remarks: string | null;
  markedBy: string | null;
}

export interface LeaveApplicationSummaryDto {
  id: number;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
}

export interface AuditEntryDto {
  id: number;
  changedAt: string;
  changedByUserId: number;
  oldStatus: string;
  newStatus: string;
  oldReasonCode: string | null;
  newReasonCode: string | null;
  note: string | null;
}

export interface StudentDetailDto {
  studentId: number;
  name: string;
  className: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
  records: StudentDayRecordDto[];
  reasonsBreakdown: Record<string, number>;
  leaveApplications: LeaveApplicationSummaryDto[];
  auditHistory: AuditEntryDto[];
}

export interface HeatmapDayDto {
  date: string;
  presentCount: number;
  totalStudents: number;
  percentage: number;
}

export interface InsightsDto {
  dayOfWeekBreakdown: Record<string, number>;
  reasonsBreakdown: Record<string, number>;
  monthlyTrend: { month: string; percentage: number }[];
  comparisonToOtherClasses: Record<string, number>;
}

export interface AtRiskStudentDto {
  studentId: number;
  name: string;
  className: string;
  rollNumber: string;
  currentPct: number;
  previousPct: number;
  drop: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  lastAbsentDate: string | null;
  dominantReason: string | null;
  lastNotifiedAt: string | null;
  daysSinceNotified: number;
}

export interface AttendancePolicyDto {
  minAttendancePct: number;
  atRiskDropPct: number;
  autoNotifyParents: boolean;
  autoNotifyThresholdPct: number;
  autoNotifyCooldownDays: number;
  lastUpdatedBy: string | null;
  lastUpdatedAt: string | null;
}

export interface AnomalyDto {
  id: number;
  classId: string;
  detectedDate: string;
  classAvgPct: number;
  expectedPct: number;
  dropAmount: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AttendanceApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/admin/attendance`;

  getClassSummary(classId: number, from: string, to: string): Observable<StudentAttendanceSummaryDto[]> {
    const params = new HttpParams().set('classId', classId).set('from', from).set('to', to);
    return this.http.get<StudentAttendanceSummaryDto[]>(`${this.base}/summary`, { params });
  }

  getStudentDetail(studentId: number, from: string, to: string): Observable<StudentDetailDto> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<StudentDetailDto>(`${this.base}/student/${studentId}`, { params });
  }

  getHeatmap(classId: number, year: number): Observable<HeatmapDayDto[]> {
    const params = new HttpParams().set('classId', classId).set('year', year);
    return this.http.get<HeatmapDayDto[]>(`${this.base}/heatmap`, { params });
  }

  getInsights(classId: number, from: string, to: string): Observable<InsightsDto> {
    const params = new HttpParams().set('classId', classId).set('from', from).set('to', to);
    return this.http.get<InsightsDto>(`${this.base}/insights`, { params });
  }

  getAtRisk(classId?: number): Observable<AtRiskStudentDto[]> {
    let params = new HttpParams();
    if (classId) params = params.set('classId', classId);
    return this.http.get<AtRiskStudentDto[]>(`${this.base}/at-risk`, { params });
  }

  exportCsv(classId: number, from: string, to: string): Observable<Blob> {
    const params = new HttpParams().set('classId', classId).set('from', from).set('to', to);
    return this.http.get(`${this.base}/export/csv`, { params, responseType: 'blob' });
  }

  exportPdf(classId: number, from: string, to: string): Observable<Blob> {
    const params = new HttpParams().set('classId', classId).set('from', from).set('to', to);
    return this.http.get(`${this.base}/export/pdf`, { params, responseType: 'blob' });
  }

  getPolicy(): Observable<AttendancePolicyDto> {
    return this.http.get<AttendancePolicyDto>(`${this.base}/policy`);
  }

  updatePolicy(policy: AttendancePolicyDto): Observable<AttendancePolicyDto> {
    return this.http.put<AttendancePolicyDto>(`${this.base}/policy`, policy);
  }

  getAnomalies(): Observable<AnomalyDto[]> {
    return this.http.get<AnomalyDto[]>(`${this.base}/anomalies`);
  }

  acknowledgeAnomaly(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/anomalies/${id}/acknowledge`, null);
  }

  runScan(): Observable<{ scanned: number; atRisk: number; notified: number }> {
    return this.http.post<{ scanned: number; atRisk: number; notified: number }>(
      `${this.base}/run-scan`, null);
  }
}
