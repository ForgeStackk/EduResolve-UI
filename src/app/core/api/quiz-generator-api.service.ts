import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuizQuestion {
  id: number;
  subject?: string;
  chapter?: string;
  chapterId?: number;
  topicId?: number;
  difficulty?: Difficulty;
  language?: string;
  text: string;
  optionsJson?: string;        // raw JSON string from API
  correctOptionId?: string;
  explanation?: string;
}

export interface QuizGenerateRequest {
  chapterId?: number;
  difficulty?: Difficulty;
  language?: string;
  count?: number;
}

export interface GeneratedQuiz {
  chapterId?: number;
  difficulty?: Difficulty;
  language: string;
  requested: number;
  returned: number;
  recommendedDurationSeconds: number;
  questions: QuizQuestion[];
}

@Injectable({ providedIn: 'root' })
export class QuizGeneratorApiService {
  private http = inject(HttpClient);
  generate(req: QuizGenerateRequest): Observable<GeneratedQuiz> {
    return this.http.post<GeneratedQuiz>(`${environment.apiBaseUrl}/quiz/generate`, req);
  }
}
