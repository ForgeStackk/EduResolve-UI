import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReportsService } from './reports.service';
import { TeacherPortalService } from '../../shared/services/teacher-portal.service';
import { AttendanceReport, StudentAttendanceSummary } from '../../shared/models/teacher-portal.models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {
  private svc    = inject(ReportsService);
  private portal = inject(TeacherPortalService);

  // ── Selectors ─────────────────────────────────────────────────────────────
  private _today = new Date();

  selectedMonth = signal(this._today.getMonth() + 1);
  selectedYear  = signal(this._today.getFullYear());

  readonly months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('en-IN', { month: 'long' })
  }));

  readonly years = Array.from({ length: 5 }, (_, i) => this._today.getFullYear() - 2 + i);

  // ── Derived ───────────────────────────────────────────────────────────────
  classId = computed(() => this.portal.classTeacherClass()?.classId ?? '');

  className = computed(() => {
    const c = this.portal.classTeacherClass();
    return c ? `${c.className}-${c.section}` : '';
  });

  selectedMonthLabel = computed(() =>
    this.months.find(m => m.value === this.selectedMonth())?.label ?? ''
  );

  /** True when the selected month+year is the current calendar month. */
  isCurrentMonth = computed(() => {
    const now = new Date();
    return this.selectedMonth() === now.getMonth() + 1 &&
           this.selectedYear()  === now.getFullYear();
  });

  /**
   * Returns a human-readable partial-report label when the report was generated
   * for an in-progress month. Returns null for complete months.
   *
   * Example: "Partial Report — 1 May to 18 May 2026 (15 of 22 working days)"
   */
  partialLabel = computed((): string | null => {
    const r = this.report();
    if (!r || !this.isCurrentMonth()) return null;
    if (r.isPartial === false) return null;  // backend explicitly says it's complete

    const year  = this.selectedYear();
    const mn    = this.selectedMonthLabel();
    const today = new Date().getDate();

    // Use backend dates if provided, otherwise compute from today.
    const toDay  = r.toDate ? new Date(r.toDate).getDate() : today;
    const wdDone = r.summary.totalWorkingDays;
    const wdFull = r.summary.projectedWorkingDays;

    const range = `1 ${mn} to ${toDay} ${mn} ${year}`;
    const days  = wdFull && wdFull !== wdDone
      ? `${wdDone} of ${wdFull} working days`
      : `${wdDone} working day${wdDone !== 1 ? 's' : ''} recorded so far`;

    return `Partial Report — ${range} (${days})`;
  });

  // ── State ─────────────────────────────────────────────────────────────────
  report    = signal<AttendanceReport | null>(null);
  loading   = signal(false);
  generating = signal(false);
  sending   = signal(false);
  sent      = signal(false);
  notFound  = signal(false);
  error     = signal<string | null>(null);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void { this.load(); }

  // ── Data loading ──────────────────────────────────────────────────────────
  onMonthChange(v: string): void { this.selectedMonth.set(+v); this.load(); }
  onYearChange(v: string):  void { this.selectedYear.set(+v);  this.load(); }

  load(): void {
    const id = this.classId();
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.sent.set(false);
    this.svc.get(id, this.selectedMonth(), this.selectedYear()).subscribe({
      next:  r  => { this.report.set(r); this.loading.set(false); },
      error: err => {
        this.report.set(null);
        this.loading.set(false);
        if (err.status === 404) { this.notFound.set(true); }
        else { this.error.set('Failed to load report. Please try again.'); }
      }
    });
  }

  generate(): void {
    const id = this.classId();
    if (!id) return;
    this.generating.set(true);
    this.error.set(null);
    this.svc.generate(id, this.selectedMonth(), this.selectedYear()).subscribe({
      next:  r  => { this.report.set(r); this.generating.set(false); this.notFound.set(false); },
      error: err => {
        this.error.set(err?.error?.message ?? err?.error ?? 'Generation failed.');
        this.generating.set(false);
      }
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  downloadPdf(): void {
    const url = this.report()?.reportFileUrl;
    if (url) window.open(url, '_blank', 'noopener');
  }

  sendToAll(): void {
    const r = this.report();
    if (!r) return;
    this.sending.set(true);
    this.error.set(null);
    this.svc.send(r.reportId, ['STUDENT_PORTAL', 'PARENT_PORTAL']).subscribe({
      next:  () => { this.sending.set(false); this.sent.set(true); },
      error: ()  => {
        this.error.set('Failed to send report. Please try again.');
        this.sending.set(false);
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  /** (present + late) / totalWorkingDays × 100, or null when no data. */
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
}
