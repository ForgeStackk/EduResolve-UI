import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type PYQDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface PreviousYearQuestion {
  id: number;
  chapterId: number;
  topicId?: number;
  year: number;
  board?: string;
  difficulty?: PYQDifficulty;
  language: string;
  questionType?: string;
  marks?: number;
  text: string;
  modelAnswer?: string;
}

@Injectable({ providedIn: 'root' })
export class PyqApiService {
  private http = inject(HttpClient);
  list(chapterId: number, opts?: { difficulty?: PYQDifficulty; year?: number }): Observable<PreviousYearQuestion[]> {
    let url = `${environment.apiBaseUrl}/pyqs?chapterId=${chapterId}`;
    if (opts?.difficulty) url += `&difficulty=${opts.difficulty}`;
    if (opts?.year != null) url += `&year=${opts.year}`;
    return this.http.get<PreviousYearQuestion[]>(url);
  }
}
