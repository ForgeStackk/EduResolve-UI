import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DoubtApiService } from './core/api/doubt-api.service';

export interface DoubtResponse {
  id: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoubtService {
  private api = inject(DoubtApiService);

  askQuestion(query: string, studentId?: number): Observable<DoubtResponse> {
    return this.api.ask({ query, studentId }).pipe(
      map(d => ({ id: String(d.id), answer: d.answer }))
    );
  }

  submitFeedback(id: string, isHelpful: boolean): Observable<boolean> {
    return this.api.feedback(Number(id), isHelpful).pipe(map(() => true));
  }
}