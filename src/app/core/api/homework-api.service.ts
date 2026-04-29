import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Homework {
  id?: number;
  title: string;
  description: string;
  dueDate: string; // ISO yyyy-MM-dd
  hasAttachment: boolean;
  teacherId?: number;
  className?: string;
  subject?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class HomeworkApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/homework`;

  list(params?: { className?: string; teacherId?: number }): Observable<Homework[]> {
    const qs: Record<string, string> = {};
    if (params?.className) qs['className'] = params.className;
    if (params?.teacherId !== undefined) qs['teacherId'] = String(params.teacherId);
    return this.http.get<Homework[]>(this.base, { params: qs });
  }

  create(hw: Homework): Observable<Homework> {
    return this.http.post<Homework>(this.base, hw);
  }

  update(id: number, hw: Homework): Observable<Homework> {
    return this.http.put<Homework>(`${this.base}/${id}`, hw);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
