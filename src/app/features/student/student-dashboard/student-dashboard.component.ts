import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StudentApiService } from '../../../core/api/student-api.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  private studentApi = inject(StudentApiService);
  private auth = inject(AuthService);

  isLoading = signal(true);

  /** Profile metrics (loaded from API; defaults shown until then). */
  studentName = signal<string>('');
  className = signal<string>('');
  initials = signal<string>('');
  grade = signal<string>('');
  streakDays = signal(0);
  experiencePoints = signal(0);
  topPercentage = signal(0);

  /** Derived greeting: "Marcus" from "Marcus Thomas". */
  firstName = computed(() => this.studentName().split(' ')[0] || '');

  ngOnInit(): void {
    const loggedInName = this.auth.currentUser()?.name;
    this.studentApi.list().subscribe({
      next: rows => {
        // Prefer the profile that matches the logged-in user; fall back to the first.
        const me = rows.find(r => r.name === loggedInName) ?? rows[0];
        if (me) {
          this.studentName.set(me.name ?? '');
          this.className.set(me.className ?? '');
          this.initials.set(me.initials ?? '');
          this.grade.set(me.grade ?? '');
          this.streakDays.set(me.streakDays ?? 0);
          this.experiencePoints.set(me.experiencePoints ?? 0);
          this.topPercentage.set(me.topPercentage ?? 0);
        }
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Student profile load failed', err);
        this.isLoading.set(false);
      }
    });
  }
}