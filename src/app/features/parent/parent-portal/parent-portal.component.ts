import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
  templateUrl: './parent-portal.component.html',
  styleUrl: './parent-portal.component.css'
})
export class ParentPortalComponent implements OnInit {
  private eventApi = inject(EventApiService);
  private complaintApi = inject(ComplaintApiService);

  tickets = signal<Ticket[]>([]);
  events = signal<UiEvent[]>([]);

  ngOnInit(): void {
    this.eventApi.list().subscribe({
      next: rows => this.events.set(rows.map(e => this.toUiEvent(e.title, e.location, e.eventDate, e.eventTime, e.attendeesCount, e.id))),
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
