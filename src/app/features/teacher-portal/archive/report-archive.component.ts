import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../my-class/reports/reports.service';
import { TeacherPortalService } from '../shared/services/teacher-portal.service';
import { AttendanceReport, StudentAttendanceSummary, TeacherClass } from '../shared/models/teacher-portal.models';

@Component({
  selector: 'app-report-archive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-archive.component.html'
})
export class ReportArchiveComponent implements OnInit {
  private svc    = inject(ReportsService);
  private portal = inject(TeacherPortalService);

  // ── Selectors ─────────────────────────────────────────────────────────────
  private _now = new Date();

  classes       = signal<TeacherClass[]>([]);
  selectedClass = signal<TeacherClass | null>(null);
  selectedMonth = signal(this._now.getMonth() + 1);
  selectedYear  = signal(this._now.getFullYear());

  readonly months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('en-IN', { month: 'long' })
  }));

  readonly years = Array.from({ length: 5 }, (_, i) => this._now.getFullYear() - 4 + i);

  selectedMonthLabel = computed(() =>
    this.months.find(m => m.value === this.selectedMonth())?.label ?? ''
  );

  // ── State ─────────────────────────────────────────────────────────────────
  report   = signal<AttendanceReport | null>(null);
  loading  = signal(false);
  notFound = signal(false);
  error    = signal<string | null>(null);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const cached = this.portal.myClasses();
    const list = cached ?? [];
    this.classes.set(list);
    if (list.length > 0) {
      this.selectedClass.set(list[0]);
      this.load();
    } else {
      this.portal.loadMyClasses().subscribe(c => {
        this.classes.set(c);
        if (c.length > 0) { this.selectedClass.set(c[0]); this.load(); }
      });
    }
  }

  // ── Controls ──────────────────────────────────────────────────────────────
  onClassChange(classId: string): void {
    const cls = this.classes().find(c => c.classId === classId) ?? null;
    this.selectedClass.set(cls);
    this.load();
  }

  onMonthChange(v: string): void { this.selectedMonth.set(+v); this.load(); }
  onYearChange(v: string):  void { this.selectedYear.set(+v);  this.load(); }

  load(): void {
    const cls = this.selectedClass();
    if (!cls) return;
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.svc.get(cls.classId, this.selectedMonth(), this.selectedYear()).subscribe({
      next:  r  => { this.report.set(r); this.loading.set(false); },
      error: err => {
        this.report.set(null);
        this.loading.set(false);
        if (err.status === 404) { this.notFound.set(true); }
        else { this.error.set('Failed to load report.'); }
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  attendancePct(row: StudentAttendanceSummary): number | null {
    const total = this.report()?.summary.totalWorkingDays ?? 0;
    if (total === 0) return null;
    return Math.min(100, ((row.present + row.late) / total) * 100);
  }

  pctClass(pct: number | null): string {
    if (pct === null) return 'text-gray-500';
    if (pct >= 85) return 'text-green-400';
    if (pct >= 75) return 'text-yellow-400';
    return 'text-red-400';
  }

  downloadPdf(): void {
    const url = this.report()?.reportFileUrl;
    if (url) window.open(url, '_blank', 'noopener');
  }
}
