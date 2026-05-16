import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StudentDocument {
  id: number;
  studentId: number;
  originalName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class StudentDocumentApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/student-docs`;

  upload(file: File, studentId: number): Observable<StudentDocument> {
    const form = new FormData();
    form.append('file', file);
    form.append('studentId', String(studentId));
    return this.http.post<StudentDocument>(`${this.base}/upload`, form);
  }

  listByStudent(studentId: number): Observable<StudentDocument[]> {
    return this.http.get<StudentDocument[]>(`${this.base}/student/${studentId}`);
  }

  getContentUrl(docId: number): string {
    return `${this.base}/${docId}/content`;
  }

  delete(docId: number, studentId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${docId}`, {
      params: { studentId: String(studentId) }
    });
  }
}
