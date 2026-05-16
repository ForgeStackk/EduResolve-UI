import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EventApiService } from '../../../core/api/event-api.service';
import { ComplaintApiService } from '../../../core/api/complaint-api.service';

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

  tickets = signal<Ticket[]>([]);
  events = signal<UiEvent[]>([]);
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
