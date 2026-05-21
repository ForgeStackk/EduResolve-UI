import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  StudentSubmissionApiService,
  HomeworkSubmission
} from '../../../core/api/student-submission-api.service';
import { StudentActivityService } from '../../../core/student-activity.service';
import { StudentComposerComponent } from '../../../shared/student-composer/student-composer.component';

@Component({
  selector: 'app-homework-submit',
  standalone: true,
  imports: [CommonModule, TranslateModule, StudentComposerComponent],
  template: `
    <div class="max-w-2xl mx-auto p-4 space-y-4">

      <!-- Header -->
      <div class="flex items-center gap-3">
        <button class="text-white/60 hover:text-white transition-colors"
                (click)="goBack()">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 class="text-white font-bold text-lg">Submit Homework</h1>
          @if (assignmentId()) {
            <p class="text-white/40 text-xs">Assignment: {{ assignmentId() }}</p>
          }
        </div>
      </div>

      <!-- Existing submission status -->
      @if (existing()) {
        <div class="hud-card p-3 flex items-center gap-3"
             [style.border-color]="existing()!.status === 'REVIEWED' ? '#10b981' : 'rgba(245,158,11,0.4)'">
          <span class="material-symbols-outlined"
                [style.color]="existing()!.status === 'REVIEWED' ? '#10b981' : '#f59e0b'">
            {{ existing()!.status === 'REVIEWED' ? 'task_alt' : 'pending' }}
          </span>
          <div>
            <p class="text-sm font-bold text-white">
              {{ existing()!.status === 'REVIEWED' ? 'Reviewed by teacher' : 'Submitted' }}
            </p>
            <p class="text-xs text-white/50">
              Submitted {{ formatDate(existing()!.submittedAt) }}
              @if (existing()!.attachments.length > 0) {
                · {{ existing()!.attachments.length }} attachment(s)
              }
            </p>
          </div>
          @if (existing()!.status !== 'REVIEWED') {
            <span class="ml-auto text-xs text-amber-400">Tap below to resubmit</span>
          }
        </div>
      }

      <!-- Empty state before load -->
      @if (!assignmentId()) {
        <div class="hud-card p-8 text-center">
          <span class="material-symbols-outlined text-white/20" style="font-size:48px">assignment_late</span>
          <p class="text-white/40 text-sm mt-2">No assignment selected.</p>
        </div>
      } @else {
        <!-- Composer -->
        <div class="hud-card p-4">
          <p class="text-xs text-white/40 mb-3 uppercase tracking-widest">
            Photos of your work, voice explanation, or typed notes
          </p>
          <app-student-composer
            placeholder="Add a note for your teacher (optional)…"
            submitLabel="Submit Homework"
            [isSending]="sending()"
            [serverError]="serverError()"
            (submitted)="onSubmit($event)">
          </app-student-composer>
        </div>
      }

      <!-- Success toast -->
      @if (submitted()) {
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                    bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl
                    flex items-center gap-2 text-sm font-bold">
          <span class="material-symbols-outlined" style="font-size:18px">task_alt</span>
          Homework submitted!
        </div>
      }

    </div>
  `
})
export class HomeworkSubmitComponent implements OnInit {
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private submitApi  = inject(StudentSubmissionApiService);
  private activity   = inject(StudentActivityService);

  assignmentId = signal<number | null>(null);
  existing     = signal<HomeworkSubmission | null>(null);
  sending      = signal(false);
  submitted    = signal(false);
  serverError  = signal<string | null>(null);

  ngOnInit(): void {
    const raw = this.route.snapshot.queryParamMap.get('assignmentId');
    const id = raw ? Number(raw) : null;
    this.assignmentId.set(id);
    if (id) {
      this.submitApi.getStatus(id).subscribe({
        next: sub => this.existing.set(sub),
        error: () => {}
      });
    }
  }

  onSubmit(fd: FormData): void {
    const id = this.assignmentId();
    if (!id || id === 0) return;
    this.sending.set(true);
    this.serverError.set(null);

    this.submitApi.submit(id, fd).subscribe({
      next: result => {
        this.existing.set(result);
        this.sending.set(false);
        this.submitted.set(true);
        this.activity.record('HOMEWORK_SUBMITTED');
        setTimeout(() => { this.submitted.set(false); this.router.navigate(['/student/inbox']); }, 1800);
      },
      error: () => {
        this.sending.set(false);
        this.serverError.set('Failed to submit. Please check your connection and try again.');
      }
    });
  }

  goBack(): void { this.router.navigate(['/student/inbox']); }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
