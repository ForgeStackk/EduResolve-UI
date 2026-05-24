import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Fee } from './fee-api.service';

export interface AdminDashboardData {
  revenue: number;
  enrollment: number;
  enrollmentTarget: number;
  activeTickets: number;
  feeCollectionRate: number;
  range: string;
  recentUnpaidFees: Fee[];
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StudentSummary {
  id: number;
  name: string;
  email: string;
  className: string;
  phoneNumber: string;
  schoolName: string;
}

export interface FeeSummary {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: string;
  dueDate: string;
  daysOverdue: number;
  phone: string;
  lastReminderAt: string | null;
}

export interface TicketSummary {
  id: number;
  raisedByName: string;
  raisedByRole: string;
  assigneeName: string | null;
  category: string;
  subject: string;
  status: string;
  priority: string;
  slaDueAt: string | null;
  isSlaBreach: boolean;
  createdAt: string;
}

export interface TicketDetail extends TicketSummary {
  description: string;
  replies: { id: number; authorName: string; authorRole: string; body: string; createdAt: string }[];
}

export interface BroadcastSummary {
  id: number;
  channels: string;
  audienceGrades: string;
  message: string;
  isEmergency: boolean;
  status: string;
  recipientCount: number;
  sentByName: string;
  sentAt: string | null;
  createdAt: string;
}

export interface AuditLogEntry {
  id: number;
  actorId: number | null;
  actorName: string | null;
  actorRole: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  ip: string | null;
  detail: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/admin`;

  dashboard(range = 'today'): Observable<AdminDashboardData> {
    return this.http.get<AdminDashboardData>(`${this.base}/dashboard`, { params: { range } });
  }

  // ── Students ──────────────────────────────────────────────────────────────
  getStudents(page = 0, size = 20, search = '', className = ''): Observable<PagedResponse<StudentSummary>> {
    const params = new HttpParams()
      .set('page', page).set('size', size)
      .set('search', search).set('className', className);
    return this.http.get<PagedResponse<StudentSummary>>(`${this.base}/students`, { params });
  }

  getStudent(id: number): Observable<StudentSummary> {
    return this.http.get<StudentSummary>(`${this.base}/students/${id}`);
  }

  // ── Fees ─────────────────────────────────────────────────────────────────
  getFees(page = 0, size = 20, search = '', status = ''): Observable<PagedResponse<FeeSummary>> {
    const params = new HttpParams()
      .set('page', page).set('size', size)
      .set('search', search).set('status', status);
    return this.http.get<PagedResponse<FeeSummary>>(`${this.base}/fees`, { params });
  }

  sendFeeReminder(invoiceId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/fees/${invoiceId}/remind`, {});
  }

  getPaymentLink(invoiceId: number): Observable<{ upiLink: string; waLink: string; studentName: string; balance: number; phone: string }> {
    return this.http.get<{ upiLink: string; waLink: string; studentName: string; balance: number; phone: string }>(
      `${this.base}/fees/${invoiceId}/payment-link`
    );
  }

  // ── Tickets ───────────────────────────────────────────────────────────────
  getTickets(page = 0, size = 20, status = '', category = ''): Observable<PagedResponse<TicketSummary>> {
    const params = new HttpParams()
      .set('page', page).set('size', size)
      .set('status', status).set('category', category);
    return this.http.get<PagedResponse<TicketSummary>>(`${this.base}/tickets`, { params });
  }

  getTicket(id: number): Observable<TicketDetail> {
    return this.http.get<TicketDetail>(`${this.base}/tickets/${id}`);
  }

  createTicket(data: { subject: string; body: string; category: string; priority: string }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.base}/tickets`, data);
  }

  updateTicket(id: number, updates: { status?: string; priority?: string; assigneeName?: string }): Observable<void> {
    return this.http.patch<void>(`${this.base}/tickets/${id}`, updates);
  }

  addTicketMessage(ticketId: number, body: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.base}/tickets/${ticketId}/messages`, { body, authorName: 'Admin', authorRole: 'admin' });
  }

  // ── Broadcasts ────────────────────────────────────────────────────────────
  getBroadcasts(page = 0, size = 10): Observable<PagedResponse<BroadcastSummary>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<BroadcastSummary>>(`${this.base}/broadcasts`, { params });
  }

  createBroadcast(data: { channels: string; audienceGrades: string; message: string; isEmergency: boolean; sentByName: string }): Observable<{ id: number; recipientCount: number }> {
    return this.http.post<{ id: number; recipientCount: number }>(`${this.base}/broadcasts`, data);
  }

  // ── Audit Logs ────────────────────────────────────────────────────────────
  getAuditLogs(page = 0, size = 20, action = '', actorId = ''): Observable<PagedResponse<AuditLogEntry>> {
    const params = new HttpParams()
      .set('page', page).set('size', size)
      .set('action', action).set('actorId', actorId);
    return this.http.get<PagedResponse<AuditLogEntry>>(`${this.base}/audit-logs`, { params });
  }
}
