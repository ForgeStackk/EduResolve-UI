import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StudentApiService, StudentProfile } from '../../../core/api/student-api.service';

/** Status -> HUD accent color for the roster indicator dot. */
const STATUS_COLORS: Record<string, string> = {
  excellent: '#10b981',  // emerald
  good:      '#3b82f6',  // blue
  average:   '#f59e0b',  // amber
  'at-risk': '#dc2626',  // red
  risk:      '#dc2626'
};

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent implements OnInit {
  private studentApi = inject(StudentApiService);

  students = signal<StudentProfile[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  /** Students flagged as at-risk drive the roster alert count. */
  atRiskCount = computed(() =>
    this.students().filter(s => (s.status ?? '').toLowerCase().includes('risk')).length
  );
  totalCount = computed(() => this.students().length);

  statusColor(status?: string): string {
    return STATUS_COLORS[(status ?? '').toLowerCase()] ?? '#6b7280';
  }

  ngOnInit(): void {
    this.studentApi.list().subscribe({
      next: rows => {
        this.students.set(rows);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('Failed to load roster');
        this.loading.set(false);
        console.error(err);
      }
    });
  }
}
