import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EventApiService } from '../../../core/api/event-api.service';
import { ComplaintApiService } from '../../../core/api/complaint-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ParentInboxApiService, StudentInboxItem } from '../../../core/api/parent-inbox-api.service';

interface UiEvent {
  id: string;
  date: string;
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

@Component({
  selector: 'app-parent-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './parent-portal.component.html',
  styleUrl: './parent-portal.component.css'
})
export class ParentPortalComponent implements OnInit {
  private eventApi = inject(EventApiService);
  private complaintApi = inject(ComplaintApiService);
  private auth = inject(AuthService);
  private parentInboxApi = inject(ParentInboxApiService);

  /** Child's class label derived from the parent's stored className (e.g., "9A" → "Class 9-A"). */
  childClassLabel = computed(() => {
    const cn = this.auth.currentUser()?.className ?? '';
    if (!cn) return '';
    const g = cn.replace(/[^0-9]/g, '');
    const s = cn.replace(/[0-9]/g, '').toUpperCase();
    return s ? `Class ${g}-${s}` : (g ? `Class ${g}` : '');
  });

  parentFirstName = computed(() => {
    const user = this.auth.currentUser();
    return user?.firstName || user?.name?.split(' ')[0] || 'Parent';
  });

  tickets = signal<Ticket[]>([]);
  events = signal<UiEvent[]>([]);
  absenceAlerts = signal<StudentInboxItem[]>([]);
  concern = '';

  /**
   * Static subject-level performance snapshot. Values are the child's current
   * score followed by the class average. Wire to a real endpoint once the
   * backend exposes performance-by-subject for parents.
   */
  readonly performance: Array<{ subject: string; score: number; classAvg: number; color: string }> = [
    { subject: 'Math',    score: 88, classAvg: 74, color: '#8b5cf6' },
    { subject: 'Science', score: 92, classAvg: 78, color: '#10b981' },
    { subject: 'English', score: 85, classAvg: 80, color: '#ec4899' },
    { subject: 'History', score: 90, classAvg: 76, color: '#f59e0b' },
    { subject: 'Comp.',   score: 95, classAvg: 82, color: '#3b82f6' }
  ];

  averageScore = 92;

  ngOnInit(): void {
    this.eventApi.list().subscribe({
      next: rows => this.events.set(rows.map(e =>
        this.toUiEvent(e.title, e.location, e.eventDate, e.eventTime, e.attendeesCount, e.id))),
      error: err => console.error('Events load failed', err)
    });

    this.complaintApi.list().subscribe({
      next: rows => this.tickets.set(rows
        .filter(c => c.status !== 'Resolved')
        .map(c => ({
          id: String(c.id ?? ''),
          title: c.subject,
          meta: c.category,
          status: 'active'
        }))),
      error: err => console.error('Complaints load failed', err)
    });

    this.parentInboxApi.getInbox(0, 20).subscribe({
      next: items => this.absenceAlerts.set(
        items.filter(i => i.category === 'ABSENCE_NOTIFICATION').slice(0, 5)
      ),
      error: () => {}
    });
  }

  alertDate(sentAt: string): string {
    const d = new Date(sentAt);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private toUiEvent(title: string, location: string, isoDate: string, time?: string, attendees?: number, id?: number): UiEvent {
    const d = new Date(isoDate);
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = String(d.getDate()).padStart(2, '0');
    return {
      id: String(id ?? ''),
      date: `${month} ${day}`,
      month,
      day,
      title,
      location,
      time,
      attendees
    };
  }
}
