import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentApiService, StudentProfile } from '../../../core/api/student-api.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent implements OnInit {
  private studentApi = inject(StudentApiService);

  students = signal<StudentProfile[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

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
