import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * NCERT Content integration service
 * Fetches content from backend API based on class and subject
 * Integrates with Spring Boot backend for PDF parsing and content storage
 */

export interface NCERTBook {
  id: number;
  classGrade: string;
  subject: string;
  title: string;
  gcsUrl: string;
  pdfFilename: string;
  githubPath?: string;
  totalPages: number;
}

export interface NCERTChapter {
  id: number;
  bookId: number;
  title: string;
  chapterNumber: number;
  orderIndex: number;
  summary: string;
  startPage: number;
  endPage: number;
}

export interface ContentBlock {
  id: number;
  chapterId: number;
  blockType: 'TEXT' | 'IMAGE' | 'DIAGRAM' | 'TABLE' | 'HEADING';
  contentText: string;
  imageUrl: string;
  orderIndex: number;
  heading: string;
  pageNumber: number;
}

export interface NCERTResource {
  id: string;
  type: 'diagram' | 'map' | '3d-model' | 'interactive' | 'video';
  title: string;
  description: string;
  url?: string;
  data?: any;
  imageUrl?: string;
}

export interface QuizQuestion {
  id: number;
  chapterId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
}

@Injectable({ providedIn: 'root' })
export class NcertApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/ncert`;

  /**
   * Get all available classes
   */
  getClasses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/classes`).pipe(
      catchError(() => of(['11', '12']))
    );
  }

  /**
   * Get subjects for a specific class
   */
  getSubjectsByClass(classGrade: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/classes/${classGrade}/subjects`).pipe(
      catchError(() => of(['Mathematics', 'Physics', 'Chemistry', 'Biology']))
    );
  }

  /**
   * Get books for a specific class and subject
   */
  getBooks(classGrade: string, subject: string): Observable<NCERTBook[]> {
    return this.http.get<NCERTBook[]>(`${this.base}/books`, {
      params: { classGrade, subject }
    }).pipe(
      catchError(err => {
        console.error('[NcertApi] Failed to fetch books for', classGrade, subject, err);
        return of([] as NCERTBook[]);
      })
    );
  }

  /**
   * Get chapters for a specific book
   */
  getChapters(bookId: number): Observable<NCERTChapter[]> {
    return this.http.get<NCERTChapter[]>(`${this.base}/books/${bookId}/chapters`).pipe(
      catchError(err => {
        console.error('[NcertApi] Failed to fetch chapters for book', bookId, err);
        return of([] as NCERTChapter[]);
      })
    );
  }

  /**
   * Get chapter details
   */
  getChapter(chapterId: number): Observable<NCERTChapter> {
    return this.http.get<NCERTChapter>(`${this.base}/chapters/${chapterId}`).pipe(
      catchError(() => of({
        id: chapterId,
        bookId: 1,
        title: 'Chapter ' + chapterId,
        chapterNumber: chapterId,
        orderIndex: chapterId,
        summary: 'Chapter summary',
        startPage: 1,
        endPage: 10
      }))
    );
  }

  /**
   * Get content blocks for a chapter
   */
  getChapterContent(chapterId: number): Observable<ContentBlock[]> {
    return this.http.get<ContentBlock[]>(`${this.base}/chapters/${chapterId}/content`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Get PDF URL for a book
   */
  getPdfUrl(bookId: number): Observable<string> {
    return this.http.get<string>(`${this.base}/books/${bookId}/pdf`).pipe(
      catchError(() => of(''))
    );
  }

  /**
   * Build the URL for the pdf-content endpoint addressed by class + subject.
   * Backend: GET /api/ncert/class/{classId}/subject/{subjectId}/pdf-content
   */
  getPdfContentUrl(classId: string, subjectId: string): string {
    return `${this.base}/class/${classId}/subject/${encodeURIComponent(subjectId)}/pdf-content`;
  }

  /**
   * Generate quiz based on difficulty and chapter range
   */
  generateQuiz(difficulty: string, count: number, maxChapterId: number): Observable<QuizQuestion[]> {
    return this.http.post<QuizQuestion[]>(`${this.base}/quiz/generate`, {
      difficulty,
      count,
      maxChapterId
    }).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Get questions for a specific chapter
   */
  getChapterQuestions(chapterId: number): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${this.base}/quiz/chapters/${chapterId}/questions`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Get enriched resources for a chapter (for backward compatibility)
   */
  getChapterResources(chapterId: string): Observable<NCERTResource[]> {
    return this.getMockResources(chapterId);
  }

  /**
   * Mock books data - fallback when backend is not available
   */
  private getMockBooks(classGrade: string, subject: string): Observable<NCERTBook[]> {
    const mockBooks: NCERTBook[] = [
      {
        id: 1,
        classGrade,
        subject,
        title: `${subject} - Class ${classGrade}`,
        gcsUrl: '',
        pdfFilename: '',
        totalPages: 200
      }
    ];
    return of(mockBooks);
  }

  /**
   * Mock chapters data - fallback when backend is not available
   */
  private getMockChapters(bookId: number): Observable<NCERTChapter[]> {
    const mockChapters: NCERTChapter[] = [
      { id: 1, bookId, title: 'Sets', chapterNumber: 1, orderIndex: 1, summary: 'Introduction to sets', startPage: 1, endPage: 20 },
      { id: 2, bookId, title: 'Relations and Functions', chapterNumber: 2, orderIndex: 2, summary: 'Understanding functions', startPage: 21, endPage: 40 },
      { id: 3, bookId, title: 'Trigonometric Functions', chapterNumber: 3, orderIndex: 3, summary: 'Trigonometry basics', startPage: 41, endPage: 60 }
    ];
    return of(mockChapters);
  }

  /**
   * Mock resources - fallback when backend is not available
   */
  private getMockResources(chapterId: string): Observable<NCERTResource[]> {
    const mockResources: Record<string, NCERTResource[]> = {
      '1': [
        { id: 'res1', type: 'diagram', title: 'Venn Diagram', description: 'Visual representation of sets', imageUrl: '' },
        { id: 'res2', type: 'interactive', title: 'Set Operations', description: 'Interactive tool' }
      ]
    };
    return of(mockResources[chapterId] || []);
  }
}
