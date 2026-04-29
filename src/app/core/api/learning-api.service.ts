import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Subject { id: number; name: string; grade: string; icon?: string; colorHex?: string; }
export interface Chapter { id: number; subjectId: number; name: string; orderIndex?: number; summary?: string; estimatedMinutes?: number; }
export interface Topic   { id: number; chapterId: number; name: string; orderIndex?: number; summary?: string; }

export type ChunkType = 'SUMMARY' | 'EXPLANATION' | 'EXAMPLE' | 'IMPORTANT_QA' | 'FLASHCARD' | 'ONE_PAGE_NOTE';
export interface ContentChunk {
  id: number; topicId: number; chunkType: ChunkType; language: string;
  title?: string; body: string; orderIndex?: number; source?: string;
}

@Injectable({ providedIn: 'root' })
export class LearningApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}`;

  // Subjects
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
