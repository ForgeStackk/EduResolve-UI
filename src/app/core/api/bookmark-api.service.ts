import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type BookmarkTarget = 'CONTENT' | 'QUIZ_QUESTION' | 'PYQ' | 'DOUBT';

export interface Bookmark {
  id: number;
  studentId: number;
  targetType: BookmarkTarget;
  targetId: number;
  label?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class BookmarkApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/bookmarks`;

  list(studentId: number): Observable<Bookmark[]> {
    return this.http.get<Bookmark[]>(`${this.base}?studentId=${studentId}`);
  }

  add(b: Omit<Bookmark, 'id' | 'createdAt'>): Observable<Bookmark> {
    return this.http.post<Bookmark>(this.base, b);
  }

  remove(studentId: number, targetType: BookmarkTarget, targetId: number) {
    return this.http.delete<void>(`${this.base}?studentId=${studentId}&targetType=${targetType}&targetId=${targetId}`);
  }
}
