import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notice {
  id?: number;
  targetAudience: string;
  message: string;
  channels: string[] | string;
  sentAt?: string;
}

@Injectable({ providedIn: 'root' })
export class NoticeApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/notices`;

  list(): Observable<Notice[]> {
    return this.http.get<Notice[]>(this.base);
  }

  send(payload: { targetAudience: string; message: string; channels: string[] }): Observable<Notice> {
    return this.http.post<Notice>(this.base, payload);
  }
}
