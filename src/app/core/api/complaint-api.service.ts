import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ComplaintStatus = 'Pending' | 'InReview' | 'Resolved';

export interface Complaint {
  id?: number;
  parentId?: number;
  category: string;
  subject: string;
  description: string;
  status?: ComplaintStatus;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ComplaintApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/complaints`;

  list(parentId?: number): Observable<Complaint[]> {
    const params: Record<string, string> = {};
    if (parentId !== undefined) params['parentId'] = String(parentId);
    return this.http.get<Complaint[]>(this.base, { params });
  }

  create(c: Complaint): Observable<Complaint> {
    return this.http.post<Complaint>(this.base, c);
  }

  updateStatus(id: number, status: ComplaintStatus): Observable<Complaint> {
    return this.http.patch<Complaint>(`${this.base}/${id}/status`, { status });
  }
}
