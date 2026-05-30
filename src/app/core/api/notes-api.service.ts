import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NoteListItem {
  id: number;
  title: string;
  subjectId: number | null;
  subjectName: string | null;
  sourceType: string;
  language: string;
  sourceFileName: string | null;
  sourcePageCount: number | null;
  tags: string[];
  isPinned: boolean;
  isSharedToClassroom: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  contentPreview: string;
  deletedAt: string | null;
}

export interface NoteDetail extends NoteListItem {
  studentId: number;
  content: string;
  rawPrompt: string | null;
  chapterRef: string | null;
  aiModelUsed: string | null;
  isActive: boolean;
  isArchived: boolean;
  restoredAt: string | null;
  sharedClassroomId: number | null;
}

export interface NoteVersion {
  id: number;
  versionNumber: number;
  language: string;
  editedAt: string;
  contentSnapshot: string | null;
}

export interface NoteStats {
  totalNotes: number;
  notesBySubject: { subjectName: string; count: number }[];
  notesByLanguage: Record<string, number>;
  notesGeneratedToday: number;
  dailyLimitRemaining: number;
  lastGeneratedAt: string | null;
}

export interface NotePreference {
  preferredLanguage: string;
  preferredNoteLength: string;
}

export interface PdfUploadResponse {
  jobId: number;
  fileName: string;
  status: string;
}

export interface PdfStatusResponse {
  jobId: number;
  status: string;
  pageCount: number | null;
  characterCount: number | null;
  failureReason: string | null;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class NotesApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/student/notes`;

  list(params: {
    language?: string; subjectId?: number; sourceType?: string;
    isPinned?: boolean; search?: string; page?: number; size?: number;
  } = {}): Observable<PageResult<NoteListItem>> {
    const p: Record<string, string> = {};
    if (params.language)    p['language']    = params.language;
    if (params.subjectId)   p['subjectId']   = String(params.subjectId);
    if (params.sourceType)  p['sourceType']  = params.sourceType;
    if (params.isPinned != null) p['isPinned'] = String(params.isPinned);
    if (params.search)      p['search']      = params.search;
    p['page'] = String(params.page ?? 0);
    p['size'] = String(params.size ?? 30);
    return this.http.get<PageResult<NoteListItem>>(this.base, { params: p });
  }

  get(noteId: number): Observable<NoteDetail> {
    return this.http.get<NoteDetail>(`${this.base}/${noteId}`);
  }

  update(noteId: number, body: { title?: string; content?: string; tags?: string[]; isPinned?: boolean }): Observable<NoteDetail> {
    return this.http.put<NoteDetail>(`${this.base}/${noteId}`, body);
  }

  softDelete(noteId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${noteId}`);
  }

  restore(noteId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${noteId}/restore`, {});
  }

  trash(): Observable<NoteListItem[]> {
    return this.http.get<NoteListItem[]>(`${this.base}/trash`);
  }

  pin(noteId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${noteId}/pin`, {});
  }

  unpin(noteId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${noteId}/pin`);
  }

  versions(noteId: number): Observable<NoteVersion[]> {
    return this.http.get<NoteVersion[]>(`${this.base}/${noteId}/versions`);
  }

  restoreVersion(noteId: number, versionId: number): Observable<NoteDetail> {
    return this.http.post<NoteDetail>(`${this.base}/${noteId}/versions/${versionId}/restore`, {});
  }

  stats(): Observable<NoteStats> {
    return this.http.get<NoteStats>(`${this.base}/stats`);
  }

  shareToClassroom(noteId: number, classroomId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${noteId}/share`, { classroomId });
  }

  related(noteId: number): Observable<NoteListItem[]> {
    return this.http.get<NoteListItem[]>(`${this.base}/${noteId}/related`);
  }

  getPreference(): Observable<NotePreference> {
    return this.http.get<NotePreference>(`${this.base}/preference`);
  }

  savePreference(pref: NotePreference): Observable<NotePreference> {
    return this.http.put<NotePreference>(`${this.base}/preference`, pref);
  }

  uploadPdf(file: File): Observable<PdfUploadResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<PdfUploadResponse>(`${this.base}/pdf/upload`, form);
  }

  pdfStatus(jobId: number): Observable<PdfStatusResponse> {
    return this.http.get<PdfStatusResponse>(`${this.base}/pdf/${jobId}/status`);
  }

  /** Returns an AbortController cancel fn. Calls onDelta for each token, onDone(noteId) when complete. */
  generateStream(req: {
    sourceType: string; language: string; prompt?: string;
    subjectId?: number; pdfJobId?: number; noteLength?: string;
  }, handlers: {
    onDelta: (token: string) => void;
    onDone: () => void;
    onError: (msg: string) => void;
  }): () => void {
    const token = localStorage.getItem('edu_token') ?? '';
    const ctrl = new AbortController();

    fetch(`${this.base}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(req),
      signal: ctrl.signal
    }).then(async res => {
      if (!res.ok) { handlers.onError('HTTP ' + res.status); return; }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim()) handlers.onDelta(data);
          }
        }
      }
      handlers.onDone();
    }).catch(err => {
      if (err.name !== 'AbortError') handlers.onError('Connection lost');
    });

    return () => ctrl.abort();
  }
}
