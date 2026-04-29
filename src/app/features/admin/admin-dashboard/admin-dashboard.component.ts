import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../../core/api/admin-api.service';

interface FeeRecord {
  studentId: string;
  parentName: string;
  amount: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  revenue = signal(0);
  enrollment = signal(0);
  enrollmentTarget = signal(1300);

  activeTickets = signal(0);

  feeData = signal<FeeRecord[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.adminApi.dashboard().subscribe({
      next: d => {
        this.revenue.set(d.revenue);
        this.enrollment.set(d.enrollment);
        this.enrollmentTarget.set(d.enrollmentTarget);
        this.activeTickets.set(d.activeTickets);
        this.feeData.set((d.recentUnpaidFees || []).map(f => ({
          studentId: `#FS-${f.id ?? ''}`,
          parentName: f.studentName,
          amount: this.formatCurrency(f.amount)
        })));
        this.loading.set(false);
      },
      error: err => {
        console.error('Admin dashboard load failed', err);
        this.loading.set(false);
      }
    });
  }

  private formatCurrency(n: number): string {
    return `$${(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
