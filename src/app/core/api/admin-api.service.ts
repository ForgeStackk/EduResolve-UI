import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Fee } from './fee-api.service';

export interface AdminDashboardData {
  revenue: number;
  enrollment: number;
  enrollmentTarget: number;
  activeTickets: number;
  recentUnpaidFees: Fee[];
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/admin`;

  dashboard(): Observable<AdminDashboardData> {
    return this.http.get<AdminDashboardData>(`${this.base}/dashboard`);
  }
}
