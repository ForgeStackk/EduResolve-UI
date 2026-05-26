import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceApiService, type AttendancePolicyDto } from '../attendance-api.service';

@Component({
  selector: 'app-admin-attendance-policy',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './admin-attendance-policy.component.html',
  styleUrl: './admin-attendance-policy.component.css',
})
export class AdminAttendancePolicyComponent implements OnInit {
  private api = inject(AttendanceApiService);

  loading = signal(true);
  saving  = signal(false);
  saved   = signal(false);
  error   = signal('');

  policy = signal<AttendancePolicyDto>({
    minAttendancePct: 75,
    atRiskDropPct: 10,
    autoNotifyParents: false,
    autoNotifyThresholdPct: 75,
    autoNotifyCooldownDays: 7,
    lastUpdatedBy: null,
    lastUpdatedAt: null,
  });

  ngOnInit(): void {
    this.api.getPolicy().subscribe({
      next: p => { this.policy.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    this.saving.set(true);
    this.error.set('');
    this.api.updatePolicy(this.policy()).subscribe({
      next: p => {
        this.policy.set(p);
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => { this.saving.set(false); this.error.set('Failed to save policy. Please try again.'); },
    });
  }

  updateField<K extends keyof AttendancePolicyDto>(key: K, value: AttendancePolicyDto[K]): void {
    this.policy.update(p => ({ ...p, [key]: value }));
  }
}
