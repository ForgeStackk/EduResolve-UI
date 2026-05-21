import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  StudentSubmissionApiService,
  DoubtThread
} from '../../../core/api/student-submission-api.service';
import { StudentActivityService } from '../../../core/student-activity.service';
import { StudentComposerComponent } from '../../../shared/student-composer/student-composer.component';
import { LearningApiService } from '../../../core/api/learning-api.service';
import { ClassContextService } from '../../../core/class-context.service';

@Component({
  selector: 'app-student-doubts',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, StudentComposerComponent],
  template: `
    <div class="max-w-2xl mx-auto p-4 space-y-4">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-white font-bold text-xl">Ask Teacher</h1>
        <button class="hud-btn-ghost text-sm" (click)="showComposer.set(!showComposer())">
          <span class="material-symbols-outlined" style="font-size:16px">add</span>
          New Doubt
        </button>
      </div>

      <!-- New doubt composer -->
      @if (showComposer()) {
        <div class="hud-card p-4 space-y-3">
          <h2 class="text-sm font-bold text-white/70 uppercase tracking-widest">Ask a Doubt</h2>

          <!-- Subject picker -->
          @if (subjects().length > 0) {
            <div class="flex flex-wrap gap-2">
              @for (s of subjects(); track s.id) {
                <button type="button"
                        class="px-3 py-1 rounded-full text-xs border transition-colors"
                        [class.border-red-500]="selectedSubjectId() === s.id"
                        [class.text-red-400]="selectedSubjectId() === s.id"
                        [class.bg-red-500\/10]="selectedSubjectId() === s.id"
                        [class.border-white\/20]="selectedSubjectId() !== s.id"
                        [class.text-white\/60]="selectedSubjectId() !== s.id"
                        (click)="selectedSubjectId.set(s.id)">
                  {{ s.name }}
                </button>
              }
            </div>
          }

          <app-student-composer
            placeholder="Describe your doubt, or attach a photo of the problem…"
            submitLabel="Ask Teacher"
            fileAccept="image/*"
            [maxFiles]="3"
            [isSending]="asking()"
            [serverError]="askError()"
            (submitted)="onAsk($event)">
          </app-student-composer>
        </div>
      }

      <!-- Existing threads -->
      @if (loading()) {
        <div class="space-y-3">
          @for (_ of [1,2,3]; track $index) {
            <div class="h-16 rounded-xl shimmer-line"></div>
          }
        </div>
      } @else if (threads().length === 0 && !showComposer()) {
        <div class="hud-card p-10 text-center">
          <span class="material-symbols-outlined text-white/20" style="font-size:56px">help_outline</span>
          <p class="text-white/50 mt-3 text-sm">No doubts yet.</p>
          <p class="text-white/30 text-xs mt-1">Tap "New Doubt" to ask your teacher a question.</p>
        </div>
      } @else {
        <div class="space-y-2">
          @for (t of threads(); track t.threadId) {
            <a [routerLink]="['/student/doubts', t.threadId]"
               class="hud-card p-3 flex items-center gap-3 hover:border-white/20
                      transition-colors cursor-pointer"
               style="text-decoration:none">
              <div class="w-10 h-10 rounded-full bg-red-700/30 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-red-400" style="font-size:20px">
                  {{ t.status === 'RESOLVED' ? 'task_alt' : 'help' }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-bold text-white truncate">{{ t.teacherName }}</p>
                  @if (t.subjectName) {
                    <span class="text-xs text-white/40">· {{ t.subjectName }}</span>
                  }
                </div>
                <p class="text-xs text-white/50 truncate mt-0.5">
                  {{ lastMessage(t) }}
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
                <span class="material-symbols-outlined text-white/30" style="font-size:16px">chevron_right</span>
              </div>
            </a>
          }
        </div>
      }

    </div>
  `
})
export class StudentDoubtsComponent implements OnInit {
  private api        = inject(StudentSubmissionApiService);
  private activity   = inject(StudentActivityService);
  private router     = inject(Router);
  private learningApi = inject(LearningApiService);
  private classCtx   = inject(ClassContextService);

  threads            = signal<DoubtThread[]>([]);
  loading            = signal(true);
  showComposer       = signal(false);
  asking             = signal(false);
  askError           = signal<string | null>(null);
  selectedSubjectId  = signal<number | null>(null);

  subjects = signal<{ id: number; name: string }[]>([]);

  ngOnInit(): void {
    this.api.listDoubtThreads().subscribe({
      next: t => { this.threads.set(t); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    const grade = this.classCtx.grade();
    if (grade) {
      this.learningApi.listSubjects(grade).subscribe({
        next: subs => this.subjects.set(subs.map(s => ({ id: s.id, name: s.name }))),
        error: () => {}
      });
    }
  }

  onAsk(fd: FormData): void {
    this.asking.set(true);
    this.askError.set(null);

    this.api.openDoubtThread(fd, this.selectedSubjectId() ?? undefined).subscribe({
      next: thread => {
        this.threads.update(t => [thread, ...t]);
        this.asking.set(false);
        this.showComposer.set(false);
        this.activity.record('DOUBT_ASKED', { subjectId: this.selectedSubjectId() ?? undefined });
        this.router.navigate(['/student/doubts', thread.threadId]);
      },
      error: () => {
        this.asking.set(false);
        this.askError.set('Could not send your doubt. Please try again.');
      }
    });
  }

  lastMessage(t: DoubtThread): string {
    const last = t.messages.at(-1);
    if (!last) return 'No messages yet';
    return last.textBody || (last.attachments.length > 0 ? '📎 Attachment' : '…');
  }
}
