import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Doubt {
  id: number;
  studentId?: number;
  query: string;
  answer: string;
  isHelpful?: boolean | null;
  subject?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class DoubtApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/doubts`;

  list(studentId?: number): Observable<Doubt[]> {
    const params: Record<string, string> = {};
    if (studentId !== undefined) params['studentId'] = String(studentId);
    return this.http.get<Doubt[]>(this.base, { params });
  }

  ask(payload: { studentId?: number; query: string; subject?: string }): Observable<Doubt> {
    return this.http.post<Doubt>(`${this.base}/ask`, payload);
  }

  feedback(id: number, isHelpful: boolean): Observable<Doubt> {
    return this.http.post<Doubt>(`${this.base}/${id}/feedback`, { isHelpful });
  }
}
