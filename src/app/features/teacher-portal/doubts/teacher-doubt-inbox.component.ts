import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TeacherDoubtApiService } from '../../../core/api/teacher-doubt-api.service';
import { DoubtThread } from '../../../core/api/student-submission-api.service';

type FilterStatus = 'ALL' | 'OPEN' | 'RESOLVED';

@Component({
  selector: 'app-teacher-doubt-inbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-2xl space-y-4">

      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-white hud-caps tracking-widest">Student Doubts</h2>
        <div class="flex gap-2">
          @for (f of filters; track f.value) {
            <button
              (click)="filter.set(f.value)"
              class="px-3 py-1 rounded-lg text-xs font-bold transition-colors"
              [class]="filter() === f.value
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'">
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="space-y-3">
          @for (_ of [1,2,3]; track $index) {
            <div class="h-16 rounded-xl shimmer-line"></div>
          }
        </div>
      } @else if (visible().length === 0) {
        <div class="hud-card p-10 text-center">
          <span class="material-symbols-outlined text-gray-400" style="font-size:56px">inbox</span>
          <p class="text-gray-500 mt-3 text-sm">
            @if (filter() === 'OPEN') { No open doubts. }
            @else if (filter() === 'RESOLVED') { No resolved doubts. }
            @else { No student doubts yet. }
          </p>
        </div>
      } @else {
        <div class="space-y-2">
          @for (t of visible(); track t.threadId) {
            <button
              (click)="open(t.threadId)"
              class="w-full text-left rounded-xl border border-gray-700 bg-gray-900
                     p-3 flex items-center gap-3 hover:border-gray-500 transition-colors">
              <div class="w-10 h-10 rounded-full bg-red-700/30 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-red-400" style="font-size:20px">
                  {{ t.status === 'RESOLVED' ? 'task_alt' : 'help' }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-bold text-white truncate">{{ t.studentName || 'Student' }}</p>
                  @if (t.studentClass) {
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold shrink-0">
                      {{ t.studentClass }}{{ t.studentSection ? '-' + t.studentSection : '' }}
                    </span>
                  }
                </div>
                <p class="text-xs text-white/50 truncate mt-0.5">
                  {{ t.subjectName ? t.subjectName + ' · ' : '' }}{{ lastMsg(t) }}
                </p>
              </div>
              <div class="flex flex-col items-end gap-1 shrink-0">
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      [class.bg-amber-500\/15]="t.status === 'OPEN'"
                      [class.text-amber-400]="t.status === 'OPEN'"
                      [class.bg-green-500\/15]="t.status === 'RESOLVED'"
                      [class.text-green-400]="t.status === 'RESOLVED'">
                  {{ t.status }}
                </span>
                <span class="text-xs text-white/30">{{ formatDate(t.createdAt) }}</span>
              </div>
            </button>
          }
        </div>
      }
    </div>
  `
})
export class TeacherDoubtInboxComponent implements OnInit {
  private api    = inject(TeacherDoubtApiService);
  private router = inject(Router);

  threads = signal<DoubtThread[]>([]);
  loading = signal(true);
  filter  = signal<FilterStatus>('ALL');

  readonly filters: { value: FilterStatus; label: string }[] = [
    { value: 'ALL',      label: 'All'      },
    { value: 'OPEN',     label: 'Open'     },
    { value: 'RESOLVED', label: 'Resolved' },
  ];

  visible = computed(() => {
    const f = this.filter();
    return f === 'ALL' ? this.threads() : this.threads().filter(t => t.status === f);
  });

  ngOnInit(): void {
    this.api.listThreads().subscribe({
      next: t => { this.threads.set(t); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  open(threadId: number): void {
    this.router.navigate(['/teacher/doubts', threadId]);
  }

  lastMsg(t: DoubtThread): string {
    const last = t.messages.at(-1);
    if (!last) return 'No messages yet';
    return last.textBody || (last.attachments.length > 0 ? '📎 Attachment' : '…');
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
}
