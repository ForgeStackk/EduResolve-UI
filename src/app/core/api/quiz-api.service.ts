import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface QuizQuestion {
  id: number;
  subject: string;
  chapter: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

interface RawQuizQuestion {
  id: number;
  subject: string;
  chapter: string;
  text: string;
  optionsJson: string;
  correctOptionId: string;
  explanation: string;
}

@Injectable({ providedIn: 'root' })
export class QuizApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/quiz-questions`;

  list(params?: { subject?: string; chapter?: string }): Observable<QuizQuestion[]> {
    const qs: Record<string, string> = {};
    if (params?.subject) qs['subject'] = params.subject;
    if (params?.chapter) qs['chapter'] = params.chapter;
    return this.http.get<RawQuizQuestion[]>(this.base, { params: qs }).pipe(
      map(rows => rows.map(r => this.parse(r)))
    );
  }

  private parse(r: RawQuizQuestion): QuizQuestion {
    let options: { id: string; text: string }[] = [];
    try { options = JSON.parse(r.optionsJson || '[]'); } catch { options = []; }
    return {
      id: r.id,
      subject: r.subject,
      chapter: r.chapter,
      text: r.text,
      options,
      correctOptionId: r.correctOptionId,
      explanation: r.explanation
    };
  }
}
