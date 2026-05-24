import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SchoolEvent {
  id?: number;
  title: string;
  location: string;
  eventDate: string; // yyyy-MM-dd
  eventTime?: string;
  attendeesCount?: number;
}

@Injectable({ providedIn: 'root' })
export class EventApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/events`;

  list(): Observable<SchoolEvent[]> {
    return this.http.get<SchoolEvent[]>(this.base);
  }

  rsvp(id: number, userId: number): Observable<{ rsvped: boolean; totalRsvps: number }> {
    return this.http.post<{ rsvped: boolean; totalRsvps: number }>(
      `${this.base}/${id}/rsvp`, {}, { params: { userId: String(userId) } }
    );
  }

  getMyRsvps(userId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/my-rsvps`, { params: { userId: String(userId) } });
  }
}
