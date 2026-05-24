import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentFilterPipe } from '../student-filter.pipe';
import { FeeApiService, Fee, FeeStatus } from '../../../core/api/fee-api.service';

/** UI shape consumed by the template (and by `studentFilter` pipe). */
export interface Student {
  id: string;
  name: string;
  class: string;
  feeStatus: FeeStatus;
  phone: string;
}

@Component({
  selector: 'app-fee-management',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentFilterPipe],
  templateUrl: './fee-management.component.html',
  styleUrl: './fee-management.component.css'
})
export class FeeManagementComponent implements OnInit {
  private feeApi = inject(FeeApiService);

  students: Student[] = [];
  loading = signal(true);

  searchTerm = signal('');
  statusFilter = signal('All');
  isSending = signal<string | null>(null);

  ngOnInit(): void {
    this.feeApi.list().subscribe({
      next: rows => {
        this.students = rows.map(r => this.toUi(r));
        this.loading.set(false);
      },
      error: err => {
        console.error('Failed to load fees', err);
        this.loading.set(false);
      }
    });
  }

  sendReminder(studentId: string): void {
    this.isSending.set(studentId);
    this.feeApi.remind(Number(studentId)).subscribe({
      next: () => this.isSending.set(null),
      error: err => {
        console.error('Reminder failed', err);
        this.isSending.set(null);
      }
    });
  }

  private toUi(f: Fee): Student {
    return {
      id: String(f.id ?? ''),
      name: f.studentName,
      class: f.className,
      feeStatus: f.status,
      phone: f.phone
    };
  }
}