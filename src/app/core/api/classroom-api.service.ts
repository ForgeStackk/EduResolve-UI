import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClassroomInfo {
  id: number;
  name: string;
  classLabel: string;
  schoolName: string;
  memberCount: number;
  onlineCount: number;
}

export interface SubjectRoom {
  id: number;
  classroomId: number;
  subjectId: number;
  subjectName: string | null;
  name: string;
  createdAt: string;
}

export interface NoteSharePreview {
  noteId: number;
  title: string;
  language: string;
  subjectName: string | null;
  contentPreview: string;
}

export interface ClassroomMessage {
  id: number;
  roomId: number;
  roomType: string;
  senderId: number;
  senderName: string;
  senderRole: string;
  messageType: string;
  textContent: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  attachmentName: string | null;
  sharedNote: NoteSharePreview | null;
  replyToMessageId: number | null;
  isPinned: boolean;
  isDeleted: boolean;
  reactions: Record<string, number>;
  myReactions: string[];
  createdAt: string;
}

export interface ClassroomMember {
  userId: number;
  name: string;
  role: string;
  isOnline: boolean;
  lastSeenAt: string | null;
  joinedAt: string;
}

export interface GroupMember {
  userId: number;
  name: string;
  isOwner: boolean;
}

export interface StudyGroup {
  id: number;
  classroomId: number;
  name: string;
  description: string | null;
  ownerUserId: number;
  ownerName: string;
  isOwner: boolean;
  members: GroupMember[];
  createdAt: string;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class ClassroomApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/student/classroom`;

  getClassroom(): Observable<ClassroomInfo> {
    return this.http.get<ClassroomInfo>(this.base);
  }

  getSubjectRooms(classroomId: number): Observable<SubjectRoom[]> {
    return this.http.get<SubjectRoom[]>(`${this.base}/${classroomId}/subject-rooms`);
  }

  getMessages(classroomId: number, opts: {
    subjectRoomId?: number; beforeId?: number; limit?: number;
  } = {}): Observable<ClassroomMessage[]> {
    const p: Record<string, string> = { limit: String(opts.limit ?? 30) };
    if (opts.subjectRoomId) p['subjectRoomId'] = String(opts.subjectRoomId);
    if (opts.beforeId)      p['beforeId']      = String(opts.beforeId);
    return this.http.get<ClassroomMessage[]>(`${this.base}/${classroomId}/messages`, { params: p });
  }

  sendMessage(classroomId: number, body: {
    roomType?: string; messageType?: string;
    textContent?: string; sharedNoteId?: number;
    replyToMessageId?: number; subjectRoomId?: number;
  }): Observable<ClassroomMessage> {
    const params: Record<string, string> = {};
    if (body.subjectRoomId) params['subjectRoomId'] = String(body.subjectRoomId);
    return this.http.post<ClassroomMessage>(`${this.base}/${classroomId}/messages`, body, { params });
  }

  deleteMessage(classroomId: number, messageId: number, subjectRoomId?: number): Observable<void> {
    const params: Record<string, string> = {};
    if (subjectRoomId) params['subjectRoomId'] = String(subjectRoomId);
    return this.http.delete<void>(`${this.base}/${classroomId}/messages/${messageId}`, { params });
  }

  react(classroomId: number, messageId: number, emoji: string, subjectRoomId?: number): Observable<void> {
    const params: Record<string, string> = {};
    if (subjectRoomId) params['subjectRoomId'] = String(subjectRoomId);
    return this.http.post<void>(`${this.base}/${classroomId}/messages/${messageId}/react`, { emoji }, { params });
  }

  pinMessage(classroomId: number, messageId: number, subjectRoomId?: number): Observable<void> {
    const params: Record<string, string> = {};
    if (subjectRoomId) params['subjectRoomId'] = String(subjectRoomId);
    return this.http.post<void>(`${this.base}/${classroomId}/messages/${messageId}/pin`, {}, { params });
  }

  unpinMessage(classroomId: number, messageId: number, subjectRoomId?: number): Observable<void> {
    const params: Record<string, string> = {};
    if (subjectRoomId) params['subjectRoomId'] = String(subjectRoomId);
    return this.http.delete<void>(`${this.base}/${classroomId}/messages/${messageId}/pin`, { params });
  }

  getPinned(classroomId: number, subjectRoomId?: number): Observable<ClassroomMessage[]> {
    const params: Record<string, string> = {};
    if (subjectRoomId) params['subjectRoomId'] = String(subjectRoomId);
    return this.http.get<ClassroomMessage[]>(`${this.base}/${classroomId}/pinned`, { params });
  }

  search(classroomId: number, query: string, subjectRoomId?: number): Observable<PageResult<ClassroomMessage>> {
    const params: Record<string, string> = { query };
    if (subjectRoomId) params['subjectRoomId'] = String(subjectRoomId);
    return this.http.get<PageResult<ClassroomMessage>>(`${this.base}/${classroomId}/search`, { params });
  }

  getMembers(classroomId: number): Observable<ClassroomMember[]> {
    return this.http.get<ClassroomMember[]>(`${this.base}/${classroomId}/members`);
  }

  updatePresence(classroomId: number, online: boolean): Observable<void> {
    return this.http.post<void>(`${this.base}/${classroomId}/presence`, null, {
      params: { online: String(online) }
    });
  }

  reportMessage(classroomId: number, messageId: number, reason: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${classroomId}/messages/${messageId}/report`, { reason });
  }

  // ── Study groups ──────────────────────────────────────────────────────────

  createGroup(classroomId: number, body: { name: string; description?: string; memberUserIds: number[] }): Observable<StudyGroup> {
    return this.http.post<StudyGroup>(`${this.base}/${classroomId}/groups`, body);
  }

  listGroups(classroomId: number): Observable<StudyGroup[]> {
    return this.http.get<StudyGroup[]>(`${this.base}/${classroomId}/groups`);
  }

  updateGroup(classroomId: number, groupId: number, body: { name?: string; description?: string }): Observable<StudyGroup> {
    return this.http.put<StudyGroup>(`${this.base}/${classroomId}/groups/${groupId}`, body);
  }

  addGroupMembers(classroomId: number, groupId: number, memberUserIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.base}/${classroomId}/groups/${groupId}/members`, memberUserIds);
  }

  removeGroupMember(classroomId: number, groupId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${classroomId}/groups/${groupId}/members/${userId}`);
  }

  deleteGroup(classroomId: number, groupId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${classroomId}/groups/${groupId}`);
  }
}
