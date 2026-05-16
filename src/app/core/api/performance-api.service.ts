import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeakTopic {
  id: number;
  studentId: number;
  topicId: number;
  questionsAttempted: number;
  questionsCorrect: number;
  accuracy: number;
  timeSpentSeconds?: number;
  lastAttemptAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PerformanceApiService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8080/api/performance';

  list(studentId: number): Observable<WeakTopic[]> {
    return this.http.get<WeakTopic[]>(`${this.base}/${studentId}`);
  }

  weakTopics(studentId: number, limit = 3): Observable<WeakTopic[]> {
    return this.http.get<WeakTopic[]>(`${this.base}/${studentId}/weak?limit=${limit}`);
  }

  record(studentId: number, body: { topicId: number; questionsAttempted: number; questionsCorrect: number; timeSpentSeconds?: number; }): Observable<WeakTopic> {
    return this.http.post<WeakTopic>(`${this.base}/${studentId}/record`, body);
  }
}
