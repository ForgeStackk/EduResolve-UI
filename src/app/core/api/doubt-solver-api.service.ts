import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DoubtAnswer {
  id: number;
  answer: string;
  hitType: 'cache' | 'db' | 'ai';
  source: 'DB' | 'AI' | 'FALLBACK' | 'TEACHER';
  images?: string[];  // URLs to educational images
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class DoubtSolverApiService {
  private http = inject(HttpClient);

  ask(query: string, language = 'en', subject?: string, studentId?: number): Observable<DoubtAnswer> {
    return this.http.post<DoubtAnswer>(`${environment.apiBaseUrl}/doubt-solver/ask`, {
      query, language, subject, studentId
    });
  }

  askWithImage(file: File, query: string, language = 'en', subject?: string, studentId?: number): Observable<DoubtAnswer> {
    const form = new FormData();
    form.append('file', file);
    form.append('query', query);
    form.append('language', language);
    if (subject) form.append('subject', subject);
    if (studentId != null) form.append('studentId', String(studentId));
    return this.http.post<DoubtAnswer>(`${environment.apiBaseUrl}/doubt-solver/image`, form);
  }
}
