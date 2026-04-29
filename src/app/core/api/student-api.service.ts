import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StudentProfile {
  id: number;
  userId?: number;
  name: string;
  initials: string;
  color: string;
  engagement: number;
  grade: string;
  status: string;
  className?: string;
  streakDays?: number;
  experiencePoints?: number;
  topPercentage?: number;
}

@Injectable({ providedIn: 'root' })
export class StudentApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/students`;

  list(className?: string): Observable<StudentProfile[]> {
    const params: Record<string, string> = {};
    if (className) params['className'] = className;
    return this.http.get<StudentProfile[]>(this.base, { params });
  }

  getById(id: number): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.base}/${id}`);
  }
}
