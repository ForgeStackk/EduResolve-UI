import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TeacherClass, TeacherSubject, StudentRow } from '../models/teacher-portal.models';

@Injectable({ providedIn: 'root' })
export class TeacherPortalService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/v1/teacher-portal`;

  myClasses = signal<TeacherClass[] | null>(null);
  isClassTeacher = computed(() => this.myClasses()?.some(c => c.isClassTeacher) ?? false);
  classTeacherClass = computed(() => this.myClasses()?.find(c => c.isClassTeacher) ?? null);

  /** Teacher's own portal UUID — needed for WebSocket notification topic. */
  teacherPortalId = signal<string | null>(null);

  loadMyClasses(): Observable<TeacherClass[]> {
    return this.http
      .get<TeacherClass[]>(`${this.base}/my-classes`)
      .pipe(tap(classes => this.myClasses.set(classes)));
  }

  loadMe(): Observable<{ teacherId: string }> {
    return this.http
      .get<{ teacherId: string }>(`${this.base}/me`)
      .pipe(tap(r => this.teacherPortalId.set(r.teacherId)));
  }

  getMySubjects(classId: string): Observable<TeacherSubject[]> {
    return this.http.get<TeacherSubject[]>(`${this.base}/my-subjects`, {
      params: { classId }
    });
  }

  getStudentsWithParents(classId: string): Observable<StudentRow[]> {
    return this.http.get<StudentRow[]>(`${this.base}/class/${classId}/students`);
  }
}
