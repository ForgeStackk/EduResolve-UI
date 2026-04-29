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
}
