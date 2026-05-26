import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { StudentInboxApiService, StudentInboxItem, AttendanceDayDto } from '../../../core/api/student-inbox-api.service';
import { InboxWebSocketService } from '../../../core/inbox/inbox-websocket.service';
import { MessageAttachmentsComponent } from '../../../shared/message-attachments/message-attachments.component';

type Tab = 'messages' | 'notifications' | 'homework' | 'attendance';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

@Component({
  selector: 'app-student-inbox',
  standalone: true,
  imports: [CommonModule, TranslateModule, MessageAttachmentsComponent, RouterLink],
  templateUrl: './student-inbox.component.html',
  styleUrl: './student-inbox.component.css'
})
export class StudentInboxComponent implements OnInit {
  private api = inject(StudentInboxApiService);
  private ws  = inject(InboxWebSocketService);

  activeTab   = signal<Tab>('messages');
  loading     = signal(true);
  items       = signal<StudentInboxItem[]>([]);
  attendance  = signal<AttendanceDayDto[]>([]);

  attendanceMonth = signal(new Date().getMonth() + 1);
  attendanceYear  = signal(new Date().getFullYear());

  // ---- Section computeds ----
  notifications = computed(() =>
    this.items().filter(i => i.category === 'ABSENCE_NOTIFICATION')
  );

  /** All communications from teachers/admins: class notices + subject messages. */
  allMessages = computed(() =>
    this.items().filter(i => i.category === 'CLASS_NOTICE' || i.category === 'SUBJECT_MESSAGE')
  );

  /** Subject-grouped view for messages that have a subject attached. */
  subjectMessages = computed(() => {
    const msgs = this.items().filter(i => i.category === 'SUBJECT_MESSAGE');
    return this.groupBySubject(msgs);
  });

  classNotices = computed(() =>
    this.items().filter(i => i.category === 'CLASS_NOTICE')
  );

  homeworkItems = computed(() => {
    const hw = this.items().filter(i => i.category === 'HOMEWORK');
    return this.groupBySubject(hw);
  });

  notifBadge = computed(() => this.notifications().filter(i => i.readStatus === 'UNREAD').length);
  msgBadge   = computed(() => this.allMessages().filter(i => i.readStatus === 'UNREAD').length);
  hwBadge    = computed(() =>
    this.items().filter(i => i.category === 'HOMEWORK' && i.readStatus === 'UNREAD').length
  );

  currentMonthLabel = computed(() =>
    `${MONTH_NAMES[this.attendanceMonth() - 1]} ${this.attendanceYear()}`
  );

  ngOnInit(): void {
    this.loadInbox();
    this.loadAttendance();
    this.ws.clearBadge();
  }

  private loadInbox(): void {
    this.loading.set(true);
    this.api.getInbox().subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: ()   => this.loading.set(false)
    });
  }

  loadAttendance(): void {
    this.api.getAttendance(this.attendanceMonth(), this.attendanceYear()).subscribe({
      next: records => this.attendance.set(records),
      error: ()      => this.attendance.set([])
    });
  }

  prevMonth(): void {
    let m = this.attendanceMonth() - 1;
    let y = this.attendanceYear();
    if (m < 1) { m = 12; y -= 1; }
    this.attendanceMonth.set(m);
    this.attendanceYear.set(y);
    this.loadAttendance();
  }

  nextMonth(): void {
    let m = this.attendanceMonth() + 1;
    let y = this.attendanceYear();
    if (m > 12) { m = 1; y += 1; }
    this.attendanceMonth.set(m);
    this.attendanceYear.set(y);
    this.loadAttendance();
  }

  markRead(item: StudentInboxItem): void {
    if (item.readStatus === 'READ') return;
    this.api.markRead(item.inboxId).subscribe({
      next: () => this.items.update(list =>
        list.map(i => i.inboxId === item.inboxId ? { ...i, readStatus: 'READ' as const } : i)
      )
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  attendanceColor(status: string): string {
    const map: Record<string, string> = {
      PRESENT: '#10b981', ABSENT: '#dc2626',
      LATE: '#f59e0b', HALF_DAY: '#8b5cf6', HOLIDAY: '#3b82f6'
    };
    return map[status] ?? '#6b7280';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatDay(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit' });
  }

  isDue(dueDateIso: string | null): boolean {
    if (!dueDateIso) return false;
    return new Date(dueDateIso) <= new Date();
  }

  countStatus(status: string): number {
    return this.attendance().filter(r => r.status === status).length;
  }

  readonly attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'HOLIDAY'] as const;

  attendanceStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PRESENT: 'Present', ABSENT: 'Absent',
      LATE: 'Late', HALF_DAY: 'Half Day', HOLIDAY: 'Holiday'
    };
    return map[status] ?? status;
  }

  private groupBySubject(items: StudentInboxItem[]): Array<{ subject: string; items: StudentInboxItem[] }> {
    const map = new Map<string, StudentInboxItem[]>();
    for (const item of items) {
      const key = item.subjectName ?? `Subject ${item.targetSubjectId ?? ''}`;
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([subject, items]) => ({ subject, items }));
  }
}
