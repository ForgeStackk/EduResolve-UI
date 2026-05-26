import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AdminApiService, type ClassSummary } from '../../../core/api/admin-api.service';
import {
  AttendanceApiService,
  type AtRiskStudentDto,
  type AnomalyDto,
  type HeatmapDayDto,
  type InsightsDto,
  type StudentAttendanceSummaryDto,
  type StudentDetailDto,
} from './attendance-api.service';

type Tab = 'overview' | 'report' | 'atrisk';

interface HeatmapCell { date: string; pct: number | null; }
interface HeatmapMonth { label: string; cells: HeatmapCell[]; }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function isoDate(d: Date): string { return d.toISOString().split('T')[0]; }

@Component({
  selector: 'app-admin-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './admin-attendance.component.html',
  styleUrl: './admin-attendance.component.css',
})
export class AdminAttendanceComponent implements OnInit {
  private attendanceApi = inject(AttendanceApiService);
  private adminApi      = inject(AdminApiService);
  private auth          = inject(AuthService);

  // ── Filters ───────────────────────────────────────────────────────────────
  classes         = signal<ClassSummary[]>([]);
  selectedClassId = signal<number>(0);
  fromDate        = signal(isoDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
  toDate          = signal(isoDate(new Date()));

  // ── Tab ───────────────────────────────────────────────────────────────────
  activeTab = signal<Tab>('overview');

  // ── Data ──────────────────────────────────────────────────────────────────
  classSummary = signal<StudentAttendanceSummaryDto[]>([]);
  heatmapData  = signal<HeatmapDayDto[]>([]);
  insights     = signal<InsightsDto | null>(null);
  atRiskList   = signal<AtRiskStudentDto[]>([]);
  anomalies    = signal<AnomalyDto[]>([]);

  // ── Loading ───────────────────────────────────────────────────────────────
  loadingClasses  = signal(true);
  loadingSummary  = signal(false);
  loadingHeatmap  = signal(false);
  loadingInsights = signal(false);
  loadingAtRisk   = signal(false);

  // ── Heatmap year ──────────────────────────────────────────────────────────
  heatmapYear = signal(new Date().getFullYear());

  // ── Student detail drawer ─────────────────────────────────────────────────
  drawerOpen    = signal(false);
  drawerDetail  = signal<StudentDetailDto | null>(null);
  loadingDrawer = signal(false);

  // ── Notify parent modal ───────────────────────────────────────────────────
  notifyTarget  = signal<AtRiskStudentDto | null>(null);
  notifyMsg     = signal('');
  notifyLoading = signal(false);
  notifySent    = signal(false);

  // ── Manual scan ───────────────────────────────────────────────────────────
  scanning   = signal(false);
  scanResult = signal<{ scanned: number; atRisk: number; notified: number } | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  atRiskCount = computed(() => this.atRiskList().length);

  highCount   = computed(() => this.atRiskList().filter(s => s.severity === 'HIGH').length);
  mediumCount = computed(() => this.atRiskList().filter(s => s.severity === 'MEDIUM').length);
  lowCount    = computed(() => this.atRiskList().filter(s => s.severity === 'LOW').length);

  sortedSummary = computed(() =>
    [...this.classSummary()].sort((a, b) => a.percentage - b.percentage)
  );

  heatmapGrid = computed<HeatmapMonth[]>(() => {
    const year = this.heatmapYear();
    const byDate = new Map<string, HeatmapDayDto>(this.heatmapData().map(d => [d.date, d]));
    return MONTHS.map((label, mi) => {
      const daysInMonth = new Date(year, mi + 1, 0).getDate();
      const cells: HeatmapCell[] = Array.from({ length: daysInMonth }, (_, di) => {
        const date = `${year}-${String(mi + 1).padStart(2, '0')}-${String(di + 1).padStart(2, '0')}`;
        return { date, pct: byDate.get(date)?.percentage ?? null };
      });
      return { label, cells };
    });
  });

  comparisonEntries = computed(() => {
    const ins = this.insights();
    if (!ins) return [];
    return Object.entries(ins.comparisonToOtherClasses)
      .map(([label, pct]) => ({ label, pct: pct as number }))
      .sort((a, b) => b.pct - a.pct);
  });

  dowEntries = computed(() => {
    const ins = this.insights();
    if (!ins) return [];
    const ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return Object.entries(ins.dayOfWeekBreakdown)
      .map(([day, pct]) => ({ day, pct: pct as number }))
      .sort((a, b) => ORDER.indexOf(a.day) - ORDER.indexOf(b.day));
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.adminApi.getClasses().subscribe({
      next: list => { this.classes.set(list); this.loadingClasses.set(false); },
      error: () => this.loadingClasses.set(false),
    });
    this.loadAtRisk();
    this.attendanceApi.getAnomalies().subscribe({
      next: list => this.anomalies.set(list),
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  applyFilters(): void {
    const cid = this.selectedClassId();
    if (!cid) return;
    this.loadSummary(cid);
    this.loadHeatmap(cid);
    this.loadInsights(cid);
  }

  setTab(tab: Tab): void { this.activeTab.set(tab); }

  prevYear(): void { this.heatmapYear.update(y => y - 1); this.reloadHeatmap(); }
  nextYear(): void { this.heatmapYear.update(y => y + 1); this.reloadHeatmap(); }

  openDrawer(summary: StudentAttendanceSummaryDto): void {
    this.drawerOpen.set(true);
    this.drawerDetail.set(null);
    this.loadingDrawer.set(true);
    this.attendanceApi.getStudentDetail(summary.studentId, this.fromDate(), this.toDate()).subscribe({
      next: d => { this.drawerDetail.set(d); this.loadingDrawer.set(false); },
      error: () => this.loadingDrawer.set(false),
    });
  }

  closeDrawer(): void { this.drawerOpen.set(false); }

  openNotify(student: AtRiskStudentDto): void {
    this.notifySent.set(false);
    this.notifyTarget.set(student);
    this.notifyMsg.set(
      `Dear Parent, ${student.name} (Class ${student.className}) has ${student.currentPct.toFixed(1)}% attendance, below the required threshold. Please ensure regular school attendance.`
    );
  }

  closeNotify(): void { this.notifyTarget.set(null); }

  sendNotification(): void {
    const target = this.notifyTarget();
    if (!target || this.notifyLoading()) return;
    const classId = this.findClassIdByLabel(target.className);
    if (!classId) return;
    this.notifyLoading.set(true);
    const user = this.auth.currentUser();
    this.adminApi.createBroadcast({
      channels: 'whatsapp',
      classId,
      targetStudents: false,
      targetParents: true,
      targetTeachers: false,
      message: this.notifyMsg(),
      isEmergency: false,
      sentByName: user ? `${user.firstName} ${user.lastName}` : 'Admin',
    }).subscribe({
      next: () => {
        this.notifyLoading.set(false);
        this.notifySent.set(true);
        setTimeout(() => { this.closeNotify(); this.loadAtRisk(); }, 2000);
      },
      error: () => this.notifyLoading.set(false),
    });
  }

  acknowledgeAnomaly(id: number): void {
    this.attendanceApi.acknowledgeAnomaly(id).subscribe({
      next: () => this.anomalies.update(list => list.filter(a => a.id !== id)),
    });
  }

  runScan(): void {
    if (this.scanning()) return;
    this.scanning.set(true);
    this.scanResult.set(null);
    this.attendanceApi.runScan().subscribe({
      next: r => {
        this.scanning.set(false);
        this.scanResult.set(r);
        this.loadAtRisk();
        setTimeout(() => this.scanResult.set(null), 6000);
      },
      error: () => this.scanning.set(false),
    });
  }

  exportCsv(): void {
    const cid = this.selectedClassId();
    if (!cid) return;
    this.attendanceApi.exportCsv(cid, this.fromDate(), this.toDate()).subscribe({
      next: blob => this.downloadFile(blob, 'attendance.csv', 'text/csv'),
    });
  }

  exportPdf(): void {
    const cid = this.selectedClassId();
    if (!cid) return;
    this.attendanceApi.exportPdf(cid, this.fromDate(), this.toDate()).subscribe({
      next: blob => this.downloadFile(blob, 'attendance.pdf', 'application/pdf'),
    });
  }

  // ── Style helpers ─────────────────────────────────────────────────────────
  heatmapColor(pct: number | null): string {
    if (pct === null) return 'att-cell-empty';
    if (pct >= 90) return 'att-cell-high';
    if (pct >= 75) return 'att-cell-good';
    if (pct >= 60) return 'att-cell-warn';
    if (pct >= 40) return 'att-cell-low';
    return 'att-cell-crit';
  }

  pctBarColor(pct: number): string {
    if (pct >= 90) return 'att-fill-high';
    if (pct >= 75) return 'att-fill-good';
    if (pct >= 60) return 'att-fill-warn';
    return 'att-fill-low';
  }

  trendIcon(trend: string): string {
    if (trend === 'UP')   return '▲';
    if (trend === 'DOWN') return '▼';
    return '→';
  }

  trendClass(trend: string): string {
    if (trend === 'UP')   return 'text-green-600';
    if (trend === 'DOWN') return 'text-red-500';
    return 'text-gray-400';
  }

  severityClass(sev: string): string {
    if (sev === 'HIGH')   return 'hud-chip bg-red-100 text-red-700 border-red-200';
    if (sev === 'MEDIUM') return 'hud-chip bg-amber-100 text-amber-700 border-amber-200';
    return 'hud-chip bg-yellow-100 text-yellow-700 border-yellow-200';
  }

  statusClass(status: string): string {
    const s = status.toUpperCase();
    if (s === 'PRESENT') return 'text-green-600';
    if (s === 'ABSENT')  return 'text-red-500';
    if (s === 'LATE')    return 'text-amber-600';
    if (s === 'HOLIDAY') return 'text-gray-400';
    return 'text-gray-600';
  }

  classLabel(c: ClassSummary): string {
    return `${c.className.replace('Class ', '')}${c.section}`;
  }

  // ── Private ───────────────────────────────────────────────────────────────
  private loadSummary(cid: number): void {
    this.loadingSummary.set(true);
    this.attendanceApi.getClassSummary(cid, this.fromDate(), this.toDate()).subscribe({
      next: d => { this.classSummary.set(d); this.loadingSummary.set(false); },
      error: () => this.loadingSummary.set(false),
    });
  }

  private loadHeatmap(cid: number): void {
    this.loadingHeatmap.set(true);
    this.attendanceApi.getHeatmap(cid, this.heatmapYear()).subscribe({
      next: d => { this.heatmapData.set(d); this.loadingHeatmap.set(false); },
      error: () => this.loadingHeatmap.set(false),
    });
  }

  private reloadHeatmap(): void {
    const cid = this.selectedClassId();
    if (cid) this.loadHeatmap(cid);
  }

  private loadInsights(cid: number): void {
    this.loadingInsights.set(true);
    this.attendanceApi.getInsights(cid, this.fromDate(), this.toDate()).subscribe({
      next: d => { this.insights.set(d); this.loadingInsights.set(false); },
      error: () => this.loadingInsights.set(false),
    });
  }

  private loadAtRisk(): void {
    this.loadingAtRisk.set(true);
    this.attendanceApi.getAtRisk().subscribe({
      next: d => { this.atRiskList.set(d); this.loadingAtRisk.set(false); },
      error: () => this.loadingAtRisk.set(false),
    });
  }

  private findClassIdByLabel(label: string): string | null {
    const norm = label.toUpperCase();
    const cls = this.classes().find(c =>
      (c.className.replace('Class ', '') + c.section).toUpperCase() === norm
    );
    return cls?.classId ?? null;
  }

  private downloadFile(blob: Blob, filename: string, type: string): void {
    const url = window.URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    window.URL.revokeObjectURL(url);
  }
}
