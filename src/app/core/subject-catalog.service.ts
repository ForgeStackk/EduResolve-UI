import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LearningApiService } from './api/learning-api.service';
import { ClassContextService } from './class-context.service';

/**
 * Single source of truth for subject lists.
 *
 * ALL components must call this service to get subjects for the user's class.
 * Never call LearningApiService.listNcertSubjects() directly from a component.
 *
 * Results are cached in-memory per grade: the second call within a session is free.
 * Endpoint: GET /ncert/classes/{grade}/subjects
 */
@Injectable({ providedIn: 'root' })
export class SubjectCatalogService {
  private learningApi = inject(LearningApiService);
  private classCtx    = inject(ClassContextService);

  private _grade    = signal('');
  private _subjects = signal<string[]>([]);
  private _loading  = signal(false);
  private _error    = signal(false);

  /** Reactive subject list — populated for the user's locked class. */
  readonly subjects = this._subjects.asReadonly();
  /** True while the network request is in flight. */
  readonly loading  = this._loading.asReadonly();
  /** True if the last fetch failed (NCERT folder missing for this class). */
  readonly hasError = this._error.asReadonly();

  /**
   * Trigger a load for the user's locked grade.
   * Safe to call from any ngOnInit — skips if already loaded for this grade.
   */
  load(): void {
    const grade = this.classCtx.grade();
    if (this._grade() === grade && (this._subjects().length > 0 || this._error())) return;
    this._fetch(grade);
  }

  /**
   * One-shot Observable form — use inside forkJoin chains.
   * Internally primes the signal cache so subsequent load() calls are free.
   */
  getSubjects(grade?: string): Observable<string[]> {
    const g = grade ?? this.classCtx.grade();
    return this.learningApi.listNcertSubjects(g).pipe(
      tap(list => {
        if (g === (this.classCtx.grade())) {
          this._grade.set(g);
          this._subjects.set(list);
          this._loading.set(false);
          this._error.set(false);
        }
      }),
      catchError(err => {
        console.error('[SubjectCatalog] Failed to fetch subjects for grade', g, err);
        if (g === this.classCtx.grade()) {
          this._error.set(true);
          this._loading.set(false);
        }
        return of([] as string[]);
      })
    );
  }

  private _fetch(grade: string): void {
    this._grade.set(grade);
    this._loading.set(true);
    this._error.set(false);
    this.learningApi.listNcertSubjects(grade).subscribe({
      next: list => {
        this._subjects.set(list);
        this._loading.set(false);
      },
      error: err => {
        console.error('[SubjectCatalog] Failed to fetch subjects for grade', grade, err);
        this._subjects.set([]);
        this._loading.set(false);
        this._error.set(true);
      },
    });
  }
}
