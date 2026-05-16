import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Subject { id: number; name: string; grade: string; icon?: string; colorHex?: string; }
export interface Chapter { id: number; subjectId: number; name: string; orderIndex?: number; summary?: string; estimatedMinutes?: number; }
export interface Topic   { id: number; chapterId: number; name: string; orderIndex?: number; summary?: string; }

/** One chapter (= one NCERT PDF file) within a subject. */
export interface CurriculumChapter {
  bookId: number;
  chapterNumber: number;
  name: string;
  pdfFilename?: string;
}

/** A subject with all its NCERT chapters for the student's class. */
export interface CurriculumSubject {
  name: string;
  icon: string;
  colorHex: string;
  chapters: CurriculumChapter[];
}

export type ChunkType = 'SUMMARY' | 'EXPLANATION' | 'EXAMPLE' | 'IMPORTANT_QA' | 'FLASHCARD' | 'ONE_PAGE_NOTE' | 'DIAGRAM';
export interface ContentChunk {
  id: number; topicId: number; chunkType: ChunkType; language: string;
  title?: string; body: string; orderIndex?: number; source?: string; imageUrl?: string;
}

// NCERT Book interfaces
export interface NcertBook {
  id: number;
  classGrade: string;
  subject: string;
  title: string;
  githubUrl?: string;
  githubRepo?: string;
  githubPath?: string;
  pdfFilename?: string;
  totalPages?: number;
  uploadedAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class LearningApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}`;

  /**
   * Returns every subject with its NCERT chapters for the given class.
   * Pass the numeric grade ("9", "10") or the full class string ("10A") —
   * the backend strips the letter suffix automatically.
   */
  getCurriculum(classGrade: string): Observable<CurriculumSubject[]> {
    return this.http.get<CurriculumSubject[]>(`${this.base}/curriculum/${encodeURIComponent(classGrade)}`);
  }

  // NCERT Books - use these instead of Subject table
  listNcertSubjects(grade: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/ncert/classes/${grade}/subjects`);
  }

  listNcertBooksBySubject(subject: string): Observable<NcertBook[]> {
    return this.http.get<NcertBook[]>(`${this.base}/ncert/subjects/${subject}/books`);
  }

  listNcertBooks(classGrade: string, subject: string): Observable<NcertBook[]> {
    return this.http.get<NcertBook[]>(`${this.base}/ncert/books?classGrade=${classGrade}&subject=${subject}`);
  }

  getNcertBook(id: number): Observable<NcertBook> {
    return this.http.get<NcertBook>(`${this.base}/ncert/books/${id}`);
  }

  // Subjects (legacy - kept for compatibility)
  listSubjects(grade?: string): Observable<Subject[]> {
    const q = grade ? `?grade=${encodeURIComponent(grade)}` : '';
    return this.http.get<Subject[]>(`${this.base}/subjects${q}`);
  }

  // Chapters
  listChapters(subjectId?: number): Observable<Chapter[]> {
    const q = subjectId != null ? `?subjectId=${subjectId}` : '';
    return this.http.get<Chapter[]>(`${this.base}/chapters${q}`);
  }
  getChapter(id: number): Observable<Chapter> {
    return this.http.get<Chapter>(`${this.base}/chapters/${id}`);
  }

  // Topics
  listTopics(chapterId: number): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.base}/topics?chapterId=${chapterId}`);
  }

  // Content chunks
  listContent(topicId: number, language = 'en', chunkType?: ChunkType): Observable<ContentChunk[]> {
    let url = `${this.base}/content?topicId=${topicId}&language=${language}`;
    if (chunkType) url += `&chunkType=${chunkType}`;
    return this.http.get<ContentChunk[]>(url);
  }
}
