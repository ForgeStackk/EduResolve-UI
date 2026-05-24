import { Component, OnInit, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentSubmissionApiService, TeacherPickerItem } from '../../../core/api/student-submission-api.service';

@Component({
  selector: 'app-teacher-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-gray-950">

      <!-- Header -->
      <div class="px-4 pt-4 pb-3 border-b border-white/10">
        <div class="flex items-center gap-3 mb-3">
          <button type="button" class="text-white/60 hover:text-white" (click)="cancelled.emit()">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 class="text-white font-bold text-lg flex-1">Choose a Teacher</h2>
        </div>

        <!-- Search -->
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                style="font-size:18px">search</span>
          <input type="text" [(ngModel)]="query"
                 placeholder="Search by name or subject…"
                 class="w-full bg-gray-800 border border-white/10 rounded-xl pl-9 pr-4 py-2.5
                        text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500/50">
        </div>
      </div>

      <!-- Filter chips -->
      <div class="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none border-b border-white/10">
        <button type="button"
                class="shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition-colors"
                [class.bg-red-600]="activeFilter() === 'all'"
                [class.border-red-600]="activeFilter() === 'all'"
                [class.text-white]="activeFilter() === 'all'"
                [class.border-white\/20]="activeFilter() !== 'all'"
                [class.text-white\/60]="activeFilter() !== 'all'"
                (click)="setFilter('all')">All</button>

        <button type="button"
                class="shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition-colors"
                [class.bg-red-600]="activeFilter() === 'myClass'"
                [class.border-red-600]="activeFilter() === 'myClass'"
                [class.text-white]="activeFilter() === 'myClass'"
                [class.border-white\/20]="activeFilter() !== 'myClass'"
                [class.text-white\/60]="activeFilter() !== 'myClass'"
                (click)="setFilter('myClass')">Teaches My Class</button>

        @for (s of uniqueSubjects(); track s) {
          <button type="button"
                  class="shrink-0 px-3 py-1 rounded-full text-xs font-bold border transition-colors"
                  [class.bg-red-600]="activeFilter() === s"
                  [class.border-red-600]="activeFilter() === s"
                  [class.text-white]="activeFilter() === s"
                  [class.border-white\/20]="activeFilter() !== s"
                  [class.text-white\/60]="activeFilter() !== s"
                  (click)="setFilter(s)">{{ s }}</button>
        }
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto">

        @if (loading()) {
          <div class="space-y-0">
            @for (_ of [1,2,3,4,5]; track $index) {
              <div class="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <div class="w-11 h-11 rounded-full shimmer-line shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 w-32 rounded shimmer-line"></div>
                  <div class="h-3 w-48 rounded shimmer-line"></div>
                </div>
              </div>
            }
          </div>
        } @else if (loadError()) {
          <div class="flex flex-col items-center justify-center p-10 text-center">
            <span class="material-symbols-outlined text-red-400 mb-2" style="font-size:48px">wifi_off</span>
            <p class="text-white/60 text-sm">{{ loadError() }}</p>
            <button type="button" (click)="load()"
                    class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl">
              Retry
            </button>
          </div>
        } @else if (filtered().length === 0) {
          <div class="flex flex-col items-center justify-center p-10 text-center">
            <span class="material-symbols-outlined text-white/20 mb-2" style="font-size:48px">person_search</span>
            <p class="text-white/50 text-sm">No teachers found.</p>
            <p class="text-white/30 text-xs mt-1">Try a different search or filter.</p>
          </div>
        } @else {
          @for (t of filtered(); track t.teacherUserId) {
            <button type="button"
                    class="w-full flex items-center gap-3 px-4 py-3 border-b border-white/5
                           hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                    (click)="pick(t)">

              <!-- Avatar -->
              <div class="w-11 h-11 rounded-full bg-red-700/30 flex items-center justify-center
                          shrink-0 text-red-300 font-bold text-sm">
                {{ initials(t.name) }}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-white font-semibold text-sm">{{ t.name }}</span>
                  @if (t.teachesMyClass) {
                    <span class="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px]
                                 font-bold rounded uppercase tracking-wide">My Class</span>
                  }
                </div>
                @if (t.subjects.length > 0) {
                  <p class="text-white/40 text-xs mt-0.5 truncate">
                    {{ t.subjects.join(' • ') }}
                  </p>
                }
                @if (t.classNames.length > 0) {
                  <p class="text-white/25 text-[10px] mt-0.5 truncate">
                    {{ t.classNames.join(', ') }}
                  </p>
                }
              </div>

              <span class="material-symbols-outlined text-white/20 shrink-0"
                    style="font-size:18px">chevron_right</span>
            </button>
          }
        }

      </div>
    </div>
  `
})
export class TeacherPickerComponent implements OnInit {
  private api = inject(StudentSubmissionApiService);

  @Output() picked    = new EventEmitter<TeacherPickerItem>();
  @Output() cancelled = new EventEmitter<void>();

  teachers    = signal<TeacherPickerItem[]>([]);
  loading     = signal(true);
  loadError   = signal<string | null>(null);
  query       = '';
  activeFilter = signal<string>('all');

  uniqueSubjects = computed(() => {
    const all = this.teachers().flatMap(t => t.subjects);
    return [...new Set(all)].sort();
  });

  filtered = computed(() => {
    const q = this.query.toLowerCase().trim();
    const f = this.activeFilter();
    return this.teachers().filter(t => {
      const matchesQuery = !q ||
        t.name.toLowerCase().includes(q) ||
        t.subjects.some(s => s.toLowerCase().includes(q));
      const matchesFilter = f === 'all' ||
        (f === 'myClass' && t.teachesMyClass) ||
        t.subjects.includes(f);
      return matchesQuery && matchesFilter;
    });
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api.listTeachersForSchool().subscribe({
      next: list => { this.teachers.set(list); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.loadError.set('Could not load teachers. Check your connection and try again.');
      }
    });
  }

  setFilter(f: string): void { this.activeFilter.set(f); }

  pick(t: TeacherPickerItem): void { this.picked.emit(t); }

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  }
}
