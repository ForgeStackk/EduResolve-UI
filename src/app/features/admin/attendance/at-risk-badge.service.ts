import { Injectable, inject, signal } from '@angular/core';
import { AttendanceApiService } from './attendance-api.service';

@Injectable({ providedIn: 'root' })
export class AtRiskBadgeService {
  private attendanceApi = inject(AttendanceApiService);

  private count = signal(0);
  readonly atRiskCount = this.count.asReadonly();

  private timerId: ReturnType<typeof setInterval> | null = null;

  start(): void {
    if (this.timerId !== null) return;
    this.poll();
    this.timerId = setInterval(() => this.poll(), 5 * 60 * 1000);
  }

  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.count.set(0);
  }

  private poll(): void {
    this.attendanceApi.getAtRisk().subscribe({
      next: list => this.count.set(list.length),
      error: () => {},
    });
  }
}
