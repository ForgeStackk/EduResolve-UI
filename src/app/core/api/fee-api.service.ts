import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type FeeStatus = 'Paid' | 'Unpaid';

export interface Fee {
  id?: number;
  studentId?: number;
  studentName: string;
  className: string;
  phone: string;
  amount: number;
  dueDate?: string;
  status: FeeStatus;
  lastReminderAt?: string;
}

@Injectable({ providedIn: 'root' })
export class FeeApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/fees`;

  list(status?: FeeStatus): Observable<Fee[]> {
    const params: Record<string, string> = {};
    if (status) params['status'] = status;
    return this.http.get<Fee[]>(this.base, { params });
  }

  create(fee: Fee): Observable<Fee> {
    return this.http.post<Fee>(this.base, fee);
  }

  remind(id: number): Observable<{ success: boolean; message: string; sentAt: string }> {
    return this.http.post<{ success: boolean; message: string; sentAt: string }>(`${this.base}/${id}/remind`, {});
  }

  summary(): Observable<{ revenue: number; unpaidCount: number; totalRecords: number }> {
    return this.http.get<{ revenue: number; unpaidCount: number; totalRecords: number }>(`${this.base}/summary`);
  }
}
