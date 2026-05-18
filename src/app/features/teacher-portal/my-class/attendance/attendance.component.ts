import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';
import { AttendanceService } from './attendance.service';
import { MessagesService } from '../../messages/messages.service';
import { TeacherPortalService } from '../../shared/services/teacher-portal.service';
import {
  AttendanceMarkRequest, AttendanceRecord, AttendanceStatus
} from '../../shared/models/teacher-portal.models';

interface EditableRow extends AttendanceRecord {
  editStatus: AttendanceStatus;
}

const QUICK_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'PRESENT',  label: 'P' },
  { value: 'ABSENT',   label: 'A' },
  { value: 'LATE',     label: 'L' },
  { value: 'HALF_DAY', label: 'H' },
];

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance.component.html'
})
export class AttendanceComponent implements OnInit {
  private svc    = inject(AttendanceService);
  private msgSvc = inject(MessagesService);
  private portal = inject(TeacherPortalService);
  private auth   = inject(AuthService);

  readonly quickOptions = QUICK_OPTIONS;
  readonly today   = this.isoDate(0);
  readonly minDate = this.isoDate(-3);

  // ── Core state ─────────────────────────────────────────────────────────────
  rows         = signal<EditableRow[]>([]);
  selectedDate = signal(this.today);
  loading      = signal(false);
  saving       = signal(false);
  saved        = signal(false);
  error        = signal<string | null>(null);

  // Notify-guardians modal
  showModal   = signal(false);
  notifying   = signal(false);
  notifySent  = signal(false);
  notifyError = signal<string | null>(null);

  // ── 409 conflict: POST /mark returned "already marked" ────────────────────
  showConflictModal = signal(false);
  /** Formatted time string extracted from the 409 body (e.g. "9:15 AM"). */
  conflictTime      = signal<string | null>(null);
  /** Stored so confirmUpdate() can re-submit without rebuilding. */
  private _pendingReq: AttendanceMarkRequest | null = null;

  // ── 409 concurrent: PUT /update optimistic-lock failure ───────────────────
  concurrentEditErr = signal(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  classId     = computed(() => this.portal.classTeacherClass()?.classId ?? '');
  className   = computed(() => {
    const c = this.portal.classTeacherClass();
    return c ? `${c.className}-${c.section}` : '';
  });
  teacherName = computed(() => {
    const u = this.auth.currentUser();
    return u ? `${u.firstName} ${u.lastName}`.trim() : 'Class Teacher';
  });

  presentCount = computed(() => this.rows().filter(r => r.editStatus === 'PRESENT').length);
  absentCount  = computed(() => this.rows().filter(r => r.editStatus === 'ABSENT').length);
  lateCount    = computed(() => this.rows().filter(r => r.editStatus === 'LATE').length);
  halfDayCount = computed(() => this.rows().filter(r => r.editStatus === 'HALF_DAY').length);
  hasAbsent    = computed(() => this.absentCount() > 0);
  absentRows   = computed(() => this.rows().filter(r => r.editStatus === 'ABSENT'));

  isAlreadyMarked = computed(() => this.rows().some(r => r.status !== null));

  displayDate = computed(() => {
    const [y, m, d] = this.selectedDate().split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d}-${months[+m - 1]}-${y}`;
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void { this.load(); }

  load(): void {
    const id = this.classId();
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);
    this.svc.getByClassAndDate(id, this.selectedDate()).subscribe({
      next: records => {
        this.rows.set(records.map(r => ({ ...r, editStatus: r.status ?? 'PRESENT' })));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load attendance. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onDateChange(date: string): void {
    this.selectedDate.set(date);
    this.saved.set(false);
    this.notifySent.set(false);
    this.concurrentEditErr.set(false);
    this.load();
  }

  // ── Row editing ────────────────────────────────────────────────────────────
  setStatus(studentId: string, status: AttendanceStatus): void {
    this.rows.update(rows =>
      rows.map(r => r.studentId === studentId ? { ...r, editStatus: status } : r)
    );
  }

  markAllPresent(): void {
    this.rows.update(rows => rows.map(r => ({ ...r, editStatus: 'PRESENT' as AttendanceStatus })));
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  saveAttendance(): void {
    this.doSave().subscribe({
      next: () => {
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: err => {
        // 409s are already handled inside doSave(); other errors surface here
        if (err?.status !== 409) {
          this.error.set('Failed to save attendance. Please try again.');
        }
      }
    });
  }

  // ── Notify-guardians modal ─────────────────────────────────────────────────
  openNotifyModal(): void {
    this.notifyError.set(null);
    this.showModal.set(true);
  }

  dismissModal(): void { this.showModal.set(false); }

  confirmNotify(): void {
    this.notifying.set(true);
    this.notifyError.set(null);
    this.doSave().subscribe({
      next: () => {
        const fd = this.buildNotifyFormData();
        this.msgSvc.send(fd).subscribe({
          next: () => {
            this.notifying.set(false);
            this.showModal.set(false);
            this.notifySent.set(true);
            this.saved.set(true);
            setTimeout(() => { this.saved.set(false); this.notifySent.set(false); }, 4000);
          },
          error: () => {
            this.notifying.set(false);
            this.notifyError.set('Message delivery failed. Attendance was saved.');
          }
        });
      },
      error: err => {
        this.notifying.set(false);
        if (this.showConflictModal()) {
          // doSave opened the conflict modal; close the notify modal so they don't overlap
          this.showModal.set(false);
        } else if (err?.status !== 409) {
          this.notifyError.set('Failed to save attendance. Please try again.');
        }
      }
    });
  }

  // ── Conflict modal actions (409 from POST /mark) ───────────────────────────
  dismissConflict(): void {
    this.showConflictModal.set(false);
    this.conflictTime.set(null);
    this._pendingReq = null;
    this.load(); // refresh to show the already-marked data
  }

  confirmUpdate(): void {
    const req = this._pendingReq;
    if (!req) return;
    this.showConflictModal.set(false);
    this.saving.set(true);
    this.error.set(null);
    this.svc.update(req).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        // Mark rows as persisted so future saves route to PUT
        this.rows.update(rows => rows.map(r => ({ ...r, status: r.editStatus })));
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => this.error.set('Update failed. Please refresh the page and try again.')
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────────
  /**
   * Core save observable. Handles both 409 scenarios internally:
   * - 409 from POST /mark  → opens conflict-resolution modal, re-throws
   * - 409 from PUT /update → shows concurrent-edit banner + auto-refreshes, re-throws
   */
  private doSave(): Observable<unknown> {
    const isUpdate = this.isAlreadyMarked();
    const req: AttendanceMarkRequest = {
      classId: this.classId(),
      date:    this.selectedDate(),
      records: this.rows().map(r => ({ studentId: r.studentId, status: r.editStatus }))
    };
    this._pendingReq = req;
    this.saving.set(true);
    this.error.set(null);
    this.concurrentEditErr.set(false);

    const call = isUpdate ? this.svc.update(req) : this.svc.mark(req);
    return call.pipe(
      catchError(err => {
        if (err?.status === 409 && !isUpdate) {
          // POST /mark → attendance for this date already exists
          const ts = err.error?.alreadyMarkedAt as string | undefined;
          this.conflictTime.set(ts ? this.formatTimestamp(ts) : 'earlier today');
          this.showConflictModal.set(true);
        } else if (err?.status === 409 && isUpdate) {
          // PUT /update → optimistic lock failure (concurrent edit)
          this.concurrentEditErr.set(true);
          setTimeout(() => {
            this.concurrentEditErr.set(false);
            this.load();
          }, 2500);
        }
        return throwError(() => err);
      }),
      finalize(() => this.saving.set(false))
    );
  }

  private buildNotifyFormData(): FormData {
    const fd = new FormData();
    fd.append('targetClassId', this.classId());
    fd.append('recipientType', 'ABSENT_GUARDIANS');
    const msg = `Dear Parent, your ward in Class ${this.className()} was marked Absent`
              + ` on ${this.displayDate()}. Please ensure regular attendance.`
              + ` — ${this.teacherName()}, Class Teacher`;
    fd.append('textBody', msg);
    return fd;
  }

  private formatTimestamp(iso: string): string {
    try {
      return new Date(iso).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch {
      return 'earlier today';
    }
  }

  private isoDate(offsetDays: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }
}
