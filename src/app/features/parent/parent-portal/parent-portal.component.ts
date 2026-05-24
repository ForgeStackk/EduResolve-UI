import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { EventApiService } from '../../../core/api/event-api.service';
import { ComplaintApiService, Complaint, ComplaintReply } from '../../../core/api/complaint-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ParentInboxApiService, StudentInboxItem, AttendanceDayDto } from '../../../core/api/parent-inbox-api.service';
import { HomeworkApiService, Homework } from '../../../core/api/homework-api.service';
import { FeeApiService, Fee, FeePaymentLink } from '../../../core/api/fee-api.service';
import { ParentApiService, ChildProfile, AiConcernResponse, ParentTeacherMessage, LeaveApplication } from '../../../core/api/parent-api.service';

interface UiEvent {
  id: string;
  month: string;
  day: string;
  title: string;
  location: string;
  time?: string;
  attendees?: number;
}

interface Ticket {
  id: string;
  title: string;
  meta: string;
  status: string;
}

interface PerformanceBar {
  subject: string;
  score: number;
  classAvg: number;
  color: string;
}

@Component({
  selector: 'app-parent-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './parent-portal.component.html',
  styleUrl: './parent-portal.component.css'
})
export class ParentPortalComponent implements OnInit {
  private eventApi       = inject(EventApiService);
  private complaintApi   = inject(ComplaintApiService);
  private auth           = inject(AuthService);
  private parentInboxApi = inject(ParentInboxApiService);
  private homeworkApi    = inject(HomeworkApiService);
  private feeApi         = inject(FeeApiService);
  private parentApi      = inject(ParentApiService);

  // ── P10: Multi-child ──────────────────────────────────────────────────────
  children     = signal<ChildProfile[]>([]);
  selectedChild = signal<ChildProfile | null>(null);

  activeClassName = computed(() =>
    this.selectedChild()?.className ?? this.auth.currentUser()?.className ?? ''
  );

  activeStudentId = computed(() =>
    this.selectedChild()?.studentId ?? this.auth.currentUser()?.studentId ?? null
  );

  // ── Computed from auth / selectedChild ───────────────────────────────────
  childClassLabel = computed(() => {
    const cn = this.activeClassName();
    if (!cn) return '';
    const g = cn.replace(/[^0-9]/g, '');
    const s = cn.replace(/[0-9]/g, '').toUpperCase();
    return s ? `Class ${g}-${s}` : (g ? `Class ${g}` : '');
  });

  parentFirstName = computed(() => {
    const user = this.auth.currentUser();
    return user?.firstName || user?.name?.split(' ')[0] || 'Parent';
  });

  // ── P1: Core data ─────────────────────────────────────────────────────────
  homework      = signal<Homework[]>([]);
  fees          = signal<Fee[]>([]);
  absenceAlerts = signal<StudentInboxItem[]>([]);
  events        = signal<UiEvent[]>([]);
  tickets       = signal<Ticket[]>([]);

  updatesBadge  = computed(() => this.homework().length + this.fees().length);

  // ── P1: UPI payment modal ─────────────────────────────────────────────────
  linkData    = signal<FeePaymentLink | null>(null);
  linkLoading = signal(false);
  actionMsg   = signal('');

  // ── P5: Ticket create modal ───────────────────────────────────────────────
  showCreateTicket  = signal(false);
  createCategory    = signal('');
  createSubject     = signal('');
  createDescription = signal('');
  createLoading     = signal(false);

  // ── P5: Ticket detail modal ───────────────────────────────────────────────
  selectedComplaint = signal<Complaint | null>(null);
  ticketReplies     = signal<ComplaintReply[]>([]);
  replyLoading      = signal(false);
  replyText         = signal('');

  // ── P6: Academic performance ──────────────────────────────────────────────
  performanceBars = signal<PerformanceBar[]>([
    { subject: 'Math',    score: 88, classAvg: 74, color: '#8b5cf6' },
    { subject: 'Science', score: 92, classAvg: 78, color: '#10b981' },
    { subject: 'English', score: 85, classAvg: 80, color: '#ec4899' },
    { subject: 'History', score: 90, classAvg: 76, color: '#f59e0b' },
    { subject: 'Comp.',   score: 95, classAvg: 82, color: '#3b82f6' },
  ]);
  avgScore = signal(92);
  perfLoaded = signal(false);

  // ── P7: RSVP ─────────────────────────────────────────────────────────────
  rsvpedIds = signal<Set<number>>(new Set());

  // ── P8: AI concern assistant ──────────────────────────────────────────────
  concern        = signal('');
  aiLoading      = signal(false);
  aiResponse     = signal<AiConcernResponse | null>(null);

  // ── P9: Notification centre ───────────────────────────────────────────────
  notifOpen    = signal(false);
  notifItems   = signal<StudentInboxItem[]>([]);
  unreadCount  = signal(0);
  notifLoading = signal(false);

  // ── Portal tab navigation ─────────────────────────────────────────────────
  activeTab = signal<'overview' | 'attendance' | 'leave' | 'messages'>('overview');

  // ── P11: Attendance calendar ──────────────────────────────────────────────
  attendanceMonth   = signal(new Date().getMonth() + 1);
  attendanceYear    = signal(new Date().getFullYear());
  attendanceDays    = signal<AttendanceDayDto[]>([]);
  attendanceLoading = signal(false);

  calendarGrid = computed(() => {
    const year  = this.attendanceYear();
    const month = this.attendanceMonth();
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDow    = new Date(year, month - 1, 1).getDay(); // 0=Sun
    const map = new Map(this.attendanceDays().map(d => [d.date.substring(0, 10), d]));
    const grid: ({ date: string; status: string | null; remarks: string | null } | null)[] =
      Array(firstDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const entry = map.get(iso);
      grid.push(entry ? { date: iso, status: entry.status, remarks: entry.remarks } : { date: iso, status: null, remarks: null });
    }
    return grid;
  });

  attendanceStats = computed(() => {
    const days = this.attendanceDays();
    return {
      present:  days.filter(d => d.status === 'PRESENT').length,
      absent:   days.filter(d => d.status === 'ABSENT').length,
      late:     days.filter(d => d.status === 'LATE').length,
      total:    days.filter(d => d.status !== 'HOLIDAY').length,
    };
  });

  // ── P12: Leave application ────────────────────────────────────────────────
  showLeaveForm       = signal(false);
  leaveStudentName    = signal('');
  leaveFromDate       = signal('');
  leaveToDate         = signal('');
  leaveReason         = signal('');
  leaveLoading        = signal(false);
  leaveApplications   = signal<LeaveApplication[]>([]);

  // ── P13: Fee history ──────────────────────────────────────────────────────
  showFeeHistory    = signal(false);
  feeHistory        = signal<Fee[]>([]);
  feeHistoryLoading = signal(false);

  // ── P14: Teacher messaging ────────────────────────────────────────────────
  teacherMessages   = signal<ParentTeacherMessage[]>([]);
  msgText           = signal('');
  msgLoading        = signal(false);

  ngOnInit(): void {
    this.loadChildren();
    this.loadEvents();
    this.loadTickets();
    this.loadAbsenceAlerts();
    this.loadHomework();
    this.loadFees();
    this.loadPerformance();
    this.loadRsvps();
    this.loadUnreadCount();
    this.loadLeaveApplications();
    this.loadAttendance();
    this.loadTeacherMessages();
  }

  // ── Loaders ───────────────────────────────────────────────────────────────

  private loadEvents(): void {
    this.eventApi.list().subscribe({
      next: rows => this.events.set(rows.map(e => this.toUiEvent(e))),
      error: () => {}
    });
  }

  private loadTickets(): void {
    this.complaintApi.list().subscribe({
      next: rows => this.tickets.set(rows
        .filter(c => c.status !== 'Resolved' && c.status !== 'Closed')
        .map(c => ({
          id:     String(c.id ?? ''),
          title:  c.subject,
          meta:   c.category,
          status: String(c.status ?? 'Pending'),
        }))),
      error: () => {}
    });
  }

  private loadAbsenceAlerts(): void {
    this.parentInboxApi.getInbox(0, 20).subscribe({
      next: items => this.absenceAlerts.set(
        items.filter(i => i.category === 'ABSENCE_NOTIFICATION').slice(0, 5)
      ),
      error: () => {}
    });
  }

  private loadHomework(): void {
    const className = this.activeClassName();
    if (!className) return;
    this.homeworkApi.list({ className }).subscribe({
      next: hw => {
        const todayIso = new Date().toISOString().split('T')[0];
        this.homework.set(
          hw
            .filter(h => !h.dueDate || h.dueDate >= todayIso)
            .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
            .slice(0, 5)
        );
      },
      error: () => {}
    });
  }

  private loadFees(): void {
    const studentId = this.activeStudentId();
    if (!studentId) return;
    this.feeApi.list(undefined, studentId).subscribe({
      next: all => this.fees.set(
        all.filter(f => f.status !== 'Paid' && f.status !== 'Waived').slice(0, 3)
      ),
      error: () => {}
    });
  }

  private loadPerformance(): void {
    const studentId = this.activeStudentId();
    if (!studentId) return;
    this.parentApi.getPerformance(studentId).subscribe({
      next: data => {
        if (data.length > 0) {
          this.performanceBars.set(data.map(d => ({
            subject:  d.subjectName,
            score:    d.avgScore,
            classAvg: 75,
            color:    d.colorHex || '#6366f1',
          })));
          const avg = Math.round(data.reduce((s, d) => s + d.avgScore, 0) / data.length);
          this.avgScore.set(avg);
          this.perfLoaded.set(true);
        }
      },
      error: () => {}
    });
  }

  private loadRsvps(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.eventApi.getMyRsvps(Number(userId)).subscribe({
      next: ids => this.rsvpedIds.set(new Set(ids)),
      error: () => {}
    });
  }

  private loadChildren(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.parentApi.getChildren(userId).subscribe({
      next: list => {
        this.children.set(list);
        if (list.length > 0 && !this.selectedChild()) {
          this.selectedChild.set(list[0]);
        }
      },
      error: () => {}
    });
  }

  private loadUnreadCount(): void {
    this.parentInboxApi.getUnreadCount().subscribe({
      next: r => this.unreadCount.set(r.count),
      error: () => {}
    });
  }

  loadAttendance(): void {
    this.attendanceLoading.set(true);
    this.parentInboxApi.getAttendance(this.attendanceMonth(), this.attendanceYear()).subscribe({
      next: days => { this.attendanceDays.set(days); this.attendanceLoading.set(false); },
      error: () => this.attendanceLoading.set(false)
    });
  }

  prevMonth(): void {
    let m = this.attendanceMonth() - 1;
    let y = this.attendanceYear();
    if (m < 1) { m = 12; y--; }
    this.attendanceMonth.set(m);
    this.attendanceYear.set(y);
    this.loadAttendance();
  }

  nextMonth(): void {
    let m = this.attendanceMonth() + 1;
    let y = this.attendanceYear();
    if (m > 12) { m = 1; y++; }
    this.attendanceMonth.set(m);
    this.attendanceYear.set(y);
    this.loadAttendance();
  }

  attendanceMonthLabel(): string {
    return new Date(this.attendanceYear(), this.attendanceMonth() - 1, 1)
      .toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  }

  attendancePct(): string {
    const s = this.attendanceStats();
    if (s.total === 0) return '--';
    return Math.round(s.present * 100 / s.total) + '%';
  }

  attendanceCellClass(status: string | null): string {
    return ({
      PRESENT:  'bg-emerald-500 text-white',
      ABSENT:   'bg-red-500 text-white',
      LATE:     'bg-amber-400 text-white',
      HALF_DAY: 'bg-amber-200 text-amber-900',
      HOLIDAY:  'bg-surface-3 text-ink-400',
    } as Record<string, string>)[status ?? ''] ?? 'bg-surface-2 text-ink-500';
  }

  private loadLeaveApplications(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.parentApi.listLeaveApplications(userId).subscribe({
      next: list => this.leaveApplications.set(list),
      error: () => {}
    });
  }

  openLeaveForm(): void {
    const child = this.selectedChild();
    this.leaveStudentName.set(child?.studentName ?? '');
    this.leaveFromDate.set('');
    this.leaveToDate.set('');
    this.leaveReason.set('');
    this.showLeaveForm.set(true);
  }

  submitLeave(): void {
    const userId    = this.auth.currentUser()?.id;
    const className = this.activeClassName();
    if (!this.leaveStudentName().trim() || !this.leaveFromDate() || !this.leaveToDate() || !this.leaveReason().trim()) return;
    this.leaveLoading.set(true);
    this.parentApi.submitLeaveApplication({
      studentName:  this.leaveStudentName(),
      className,
      parentUserId: userId ? Number(userId) : 0,
      fromDate:     this.leaveFromDate(),
      toDate:       this.leaveToDate(),
      reason:       this.leaveReason(),
    }).subscribe({
      next: saved => {
        this.leaveApplications.update(list => [saved, ...list]);
        this.showLeaveForm.set(false);
        this.leaveLoading.set(false);
        this.actionMsg.set('Leave application submitted');
        setTimeout(() => this.actionMsg.set(''), 3000);
      },
      error: () => this.leaveLoading.set(false)
    });
  }

  leaveStatusClass(status: string): string {
    return ({
      Pending:  'bg-amber-50 text-amber-700 border-amber-200',
      Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Rejected: 'bg-red-50 text-red-700 border-red-200',
    } as Record<string, string>)[status] ?? 'bg-surface-2 text-ink-600';
  }

  openFeeHistory(): void {
    const studentId = this.activeStudentId();
    if (!studentId) return;
    this.showFeeHistory.set(true);
    if (this.feeHistory().length === 0) {
      this.feeHistoryLoading.set(true);
      this.parentApi.getAllFees(studentId).subscribe({
        next: all => { this.feeHistory.set(all); this.feeHistoryLoading.set(false); },
        error: () => this.feeHistoryLoading.set(false)
      });
    }
  }

  private loadTeacherMessages(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.parentApi.getMessages(userId).subscribe({
      next: msgs => this.teacherMessages.set(msgs),
      error: () => {}
    });
  }

  onMsgEnter(event: KeyboardEvent): void {
    if (!(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      this.sendTeacherMessage();
    }
  }

  sendTeacherMessage(): void {
    const text    = this.msgText().trim();
    const userId  = this.auth.currentUser()?.id;
    const user    = this.auth.currentUser();
    const className = this.activeClassName();
    if (!text || !userId || !className) return;
    this.msgLoading.set(true);
    this.parentApi.sendMessage({
      parentUserId: Number(userId),
      className,
      senderRole:   'parent',
      senderName:   user ? `${user.firstName} ${user.lastName}`.trim() : 'Parent',
      body:         text,
    }).subscribe({
      next: saved => {
        this.teacherMessages.update(m => [...m, saved]);
        this.msgText.set('');
        this.msgLoading.set(false);
      },
      error: () => this.msgLoading.set(false)
    });
  }

  // ── P1: UPI payment link ──────────────────────────────────────────────────

  openPaymentLink(id: number): void {
    this.linkData.set(null);
    this.linkLoading.set(true);
    this.feeApi.getPaymentLink(id).subscribe({
      next: data => { this.linkData.set(data); this.linkLoading.set(false); },
      error: ()  => this.linkLoading.set(false),
    });
  }

  closeLink(): void { this.linkData.set(null); }

  copyLink(link: string): void {
    navigator.clipboard.writeText(link).then(() => {
      this.actionMsg.set('Link copied!');
      setTimeout(() => this.actionMsg.set(''), 2500);
    });
  }

  // ── P5: Ticket actions ────────────────────────────────────────────────────

  openTicketDetail(ticket: Ticket): void {
    const id = Number(ticket.id);
    this.ticketReplies.set([]);
    this.replyText.set('');
    this.replyLoading.set(true);
    this.complaintApi.get(id).subscribe({
      next: c => { this.selectedComplaint.set(c); },
      error: () => { this.replyLoading.set(false); }
    });
    this.complaintApi.getReplies(id).subscribe({
      next: r => { this.ticketReplies.set(r); this.replyLoading.set(false); },
      error: () => { this.replyLoading.set(false); }
    });
  }

  closeTicketDetail(): void {
    this.selectedComplaint.set(null);
    this.replyText.set('');
  }

  sendReply(): void {
    const complaint = this.selectedComplaint();
    if (!complaint?.id || !this.replyText().trim()) return;
    const user = this.auth.currentUser();
    this.replyLoading.set(true);
    this.complaintApi.addReply(complaint.id, {
      authorName: user ? `${user.firstName} ${user.lastName}`.trim() : 'Parent',
      authorRole: 'parent',
      body: this.replyText(),
    }).subscribe({
      next: reply => {
        this.ticketReplies.update(r => [...r, reply]);
        this.replyText.set('');
        this.replyLoading.set(false);
        // Update status chip if it changed to InReview
        this.selectedComplaint.update(c => c ? { ...c, status: 'InReview' } : c);
      },
      error: () => { this.replyLoading.set(false); }
    });
  }

  submitNewTicket(): void {
    if (!this.createCategory() || !this.createSubject() || !this.createDescription()) return;
    const user = this.auth.currentUser();
    this.createLoading.set(true);
    this.complaintApi.create({
      parentId:     user?.id ? Number(user.id) : undefined,
      category:     this.createCategory(),
      subject:      this.createSubject(),
      description:  this.createDescription(),
      raisedByName: user ? `${user.firstName} ${user.lastName}`.trim() : 'Parent',
      raisedByRole: 'parent',
    }).subscribe({
      next: saved => {
        this.tickets.update(t => [{
          id:     String(saved.id),
          title:  saved.subject,
          meta:   saved.category,
          status: String(saved.status ?? 'Pending'),
        }, ...t]);
        this.showCreateTicket.set(false);
        this.createCategory.set('');
        this.createSubject.set('');
        this.createDescription.set('');
        this.createLoading.set(false);
        this.actionMsg.set('Ticket submitted successfully');
        setTimeout(() => this.actionMsg.set(''), 3000);
      },
      error: () => { this.createLoading.set(false); }
    });
  }

  // ── P8: AI concern ────────────────────────────────────────────────────────

  submitConcern(): void {
    const text = this.concern().trim();
    if (!text) return;
    const user = this.auth.currentUser();
    this.aiLoading.set(true);
    this.aiResponse.set(null);
    const parentName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Parent';
    this.parentApi.submitAiConcern(text, user?.id ?? 0, parentName).subscribe({
      next: res => {
        this.aiResponse.set(res);
        this.aiLoading.set(false);
        if (res.ticketCreated) {
          this.loadTickets();
          this.actionMsg.set('Ticket auto-created from your concern');
          setTimeout(() => this.actionMsg.set(''), 3500);
        }
      },
      error: () => {
        this.aiResponse.set({
          message: 'AI assistant is currently unavailable. Please contact the school directly.',
          route: 'info', category: 'General', ticketCreated: false, ticketId: null
        });
        this.aiLoading.set(false);
      }
    });
  }

  clearConcern(): void {
    this.concern.set('');
    this.aiResponse.set(null);
  }

  // ── P9: Notifications ─────────────────────────────────────────────────────

  openNotifications(): void {
    this.notifOpen.set(true);
    if (this.notifItems().length === 0) {
      this.notifLoading.set(true);
      this.parentInboxApi.getInbox(0, 20).subscribe({
        next: items => { this.notifItems.set(items); this.notifLoading.set(false); },
        error: () => this.notifLoading.set(false)
      });
    }
  }

  closeNotifications(): void { this.notifOpen.set(false); }

  markAllRead(): void {
    const unread = this.notifItems().filter(i => i.readStatus === 'UNREAD');
    if (unread.length === 0) return;
    forkJoin(unread.map(i => this.parentInboxApi.markRead(i.inboxId))).subscribe({
      next: () => {
        this.notifItems.update(items => items.map(i => ({ ...i, readStatus: 'READ' as const })));
        this.unreadCount.set(0);
      },
      error: () => {}
    });
  }

  // ── P10: Multi-child ──────────────────────────────────────────────────────

  switchChild(child: ChildProfile): void {
    this.selectedChild.set(child);
    this.homework.set([]);
    this.fees.set([]);
    this.performanceBars.set([]);
    this.perfLoaded.set(false);
    this.loadHomework();
    this.loadFees();
    this.loadPerformance();
  }

  // ── P7: RSVP ─────────────────────────────────────────────────────────────

  toggleRsvp(eventId: number): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    const wasRsvped = this.rsvpedIds().has(eventId);
    const next = new Set(this.rsvpedIds());
    wasRsvped ? next.delete(eventId) : next.add(eventId);
    this.rsvpedIds.set(next);

    this.eventApi.rsvp(eventId, Number(userId)).subscribe({
      error: () => {
        const revert = new Set(this.rsvpedIds());
        wasRsvped ? revert.add(eventId) : revert.delete(eventId);
        this.rsvpedIds.set(revert);
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  daysUntilDue(dueDate: string): number {
    const todayIso = new Date().toISOString().split('T')[0];
    const todayMs  = new Date(todayIso).getTime();
    const dueMs    = new Date(dueDate).getTime();
    return Math.round((dueMs - todayMs) / 86_400_000);
  }

  dueBadge(dueDate: string): string {
    const d = this.daysUntilDue(dueDate);
    if (d < 0)  return 'Overdue';
    if (d === 0) return 'Due today';
    if (d === 1) return 'Due tomorrow';
    return `Due in ${d}d`;
  }

  dueBadgeClass(dueDate: string): string {
    const d = this.daysUntilDue(dueDate);
    if (d < 0)  return 'bg-red-100 text-red-700 border-red-200';
    if (d <= 1) return 'hud-chip-active';
    return 'bg-surface-2 text-ink-600 border-surface-3';
  }

  feeStatusClass(status: string): string {
    return ({
      Unpaid:  'bg-red-50 text-red-700 border-red-200',
      Partial: 'bg-amber-50 text-amber-700 border-amber-200',
      Overdue: 'bg-red-100 text-red-800 border-red-300',
    } as Record<string, string>)[status] ?? 'bg-surface-2 text-ink-600';
  }

  ticketStatusClass(status: string): string {
    return ({
      Pending:  'bg-amber-50 text-amber-700 border-amber-200',
      InReview: 'bg-blue-50 text-blue-700 border-blue-200',
      Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Closed:   'bg-surface-2 text-ink-500 border-surface-3',
    } as Record<string, string>)[status] ?? 'bg-surface-2 text-ink-600';
  }

  alertDate(sentAt: string): string {
    return new Date(sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private toUiEvent(e: { id?: number; title: string; location: string; eventDate: string; eventTime?: string; attendeesCount?: number }): UiEvent {
    const d     = new Date(e.eventDate);
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day   = String(d.getDate()).padStart(2, '0');
    return { id: String(e.id ?? ''), month, day, title: e.title, location: e.location, time: e.eventTime, attendees: e.attendeesCount };
  }
}
