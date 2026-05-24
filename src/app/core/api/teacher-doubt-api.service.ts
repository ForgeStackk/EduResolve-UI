import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DoubtThread, DoubtMessageItem } from './student-submission-api.service';

@Injectable({ providedIn: 'root' })
export class TeacherDoubtApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/v1/teacher-portal/doubts`;

  listThreads(studentClass?: string): Observable<DoubtThread[]> {
    let params = new HttpParams();
    if (studentClass) params = params.set('studentClass', studentClass);
    return this.http.get<DoubtThread[]>(this.base, { params });
  }

  getThread(threadId: number): Observable<DoubtThread> {
    return this.http.get<DoubtThread>(`${this.base}/${threadId}`);
  }

  reply(threadId: number, fd: FormData): Observable<DoubtMessageItem> {
    return this.http.post<DoubtMessageItem>(`${this.base}/${threadId}/reply`, fd);
  }

  resolve(threadId: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${threadId}/resolve`, {});
  }
}
