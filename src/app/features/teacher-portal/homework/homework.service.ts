import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MessageSummary, PagedResponse, SendMessageResponse } from '../shared/models/teacher-portal.models';

@Injectable({ providedIn: 'root' })
export class HomeworkService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/v1/teacher-portal`;

  send(formData: FormData): Observable<SendMessageResponse> {
    return this.http.post<SendMessageResponse>(`${this.base}/homework/send`, formData);
  }

  getSent(classId?: string, subjectId?: number, page = 0, size = 20): Observable<PagedResponse<MessageSummary>> {
    const params: Record<string, string> = { page: String(page), size: String(size) };
    if (classId) params['classId'] = classId;
    if (subjectId) params['subjectId'] = String(subjectId);
    return this.http.get<PagedResponse<MessageSummary>>(`${this.base}/homework/sent`, { params });
  }
}
