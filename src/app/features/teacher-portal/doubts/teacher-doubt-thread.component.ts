import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherDoubtApiService } from '../../../core/api/teacher-doubt-api.service';
import { DoubtThread } from '../../../core/api/student-submission-api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-teacher-doubt-thread',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto p-4 space-y-4 pb-32">

      <!-- Header -->
      <div class="flex items-center gap-3">
        <button class="text-white/60 hover:text-white transition-colors" (click)="goBack()">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="text-white font-bold text-lg truncate">
            {{ thread()?.studentName || 'Student' }}
          </h1>
          <p class="text-white/40 text-xs">
            {{ thread()?.studentClass }}{{ thread()?.studentSection ? '-' + thread()!.studentSection : '' }}
            {{ thread()?.subjectName ? ' · ' + thread()!.subjectName : '' }}
          </p>
        </div>
        @if (thread()?.status === 'OPEN') {
          <button
            class="px-3 py-1.5 rounded-lg border border-green-500/40 text-green-400
                   text-xs font-bold hover:bg-green-500/10 transition-colors"
            (click)="markResolved()">
            Mark Resolved
          </button>
        } @else {
          <span class="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold">
            Resolved ✓
          </span>
        }
      </div>

      <!-- Messages -->
      @if (loading()) {
        <div class="space-y-3">
          @for (_ of [1,2]; track $index) {
            <div class="h-16 rounded-xl shimmer-line"></div>
          }
        </div>
      } @else if ((thread()?.messages?.length ?? 0) === 0) {
        <div class="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
          <span class="material-symbols-outlined text-white/20" style="font-size:48px">forum</span>
          <p class="text-white/40 text-sm mt-2">No messages yet.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (msg of thread()?.messages ?? []; track msg.doubtMessageId) {
            <div class="flex gap-2"
                 [class.justify-end]="msg.senderRole === 'TEACHER'"
                 [class.justify-start]="msg.senderRole === 'STUDENT'">
              <div class="max-w-[80%] rounded-2xl px-4 py-3"
                   [class.bg-red-600]="msg.senderRole === 'TEACHER'"
                   [class.bg-white\/10]="msg.senderRole === 'STUDENT'">
                @if (msg.textBody) {
                  <p class="text-sm text-white">{{ msg.textBody }}</p>
                }
                @for (att of msg.attachments; track att.attachmentId) {
                  @if (att.fileType === 'IMAGE') {
                    <img [src]="attUrl(att.attachmentId)" [alt]="att.fileName"
                         class="mt-2 rounded-lg max-w-full" style="max-height:200px;object-fit:cover">
                  } @else if (att.fileType === 'VOICE') {
                    <audio controls [src]="attUrl(att.attachmentId)" class="mt-2 w-full"></audio>
                  } @else {
                    <a [href]="attUrl(att.attachmentId)" target="_blank" rel="noopener"
                       class="mt-2 flex items-center gap-1 text-xs text-white/70 hover:text-white">
                      <span class="material-symbols-outlined" style="font-size:14px">attach_file</span>
                      {{ att.fileName }}
                    </a>
                  }
                }
                <p class="text-[10px] text-white/40 mt-1 text-right">{{ formatTime(msg.sentAt) }}</p>
              </div>
            </div>
          }
        </div>
      }

      <!-- Reply composer (fixed bottom) -->
      @if (thread()?.status === 'OPEN') {
        <div class="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm border-t border-white/10">
          <div class="max-w-2xl mx-auto flex gap-2">
            <textarea
              [value]="replyText()"
              (input)="replyText.set($any($event.target).value)"
              placeholder="Reply to student…"
              rows="2"
              class="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3
                     text-white text-sm placeholder-white/30 resize-none
                     focus:outline-none focus:border-red-500 transition-colors">
            </textarea>
            <button
              (click)="sendReply()"
              [disabled]="!replyText().trim() || replying()"
              class="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold
                     rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-end">
              @if (replying()) { Sending… } @else { Send }
            </button>
          </div>
          @if (replyError()) {
            <p class="text-red-400 text-xs mt-1 max-w-2xl mx-auto">{{ replyError() }}</p>
          }
        </div>
      }

    </div>
  `
})
export class TeacherDoubtThreadComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private api    = inject(TeacherDoubtApiService);

  thread     = signal<DoubtThread | null>(null);
  loading    = signal(true);
  replying   = signal(false);
  replyError = signal<string | null>(null);
  replyText  = signal('');

  private threadId = 0;

  ngOnInit(): void {
    this.threadId = Number(this.route.snapshot.paramMap.get('threadId') ?? 0);
    if (this.threadId) this.loadThread();
  }

  private loadThread(): void {
    this.api.getThread(this.threadId).subscribe({
      next: t => { this.thread.set(t); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  sendReply(): void {
    const text = this.replyText().trim();
    if (!text) return;
    this.replying.set(true);
    this.replyError.set(null);
    const fd = new FormData();
    fd.append('textBody', text);
    this.api.reply(this.threadId, fd).subscribe({
      next: msg => {
        this.thread.update(t => t ? { ...t, messages: [...t.messages, msg] } : t);
        this.replyText.set('');
        this.replying.set(false);
      },
      error: () => {
        this.replying.set(false);
        this.replyError.set('Failed to send reply. Please try again.');
      }
    });
  }

  markResolved(): void {
    this.api.resolve(this.threadId).subscribe({
      next: () => this.thread.update(t => t ? { ...t, status: 'RESOLVED' } : t),
      error: () => {}
    });
  }

  attUrl(attachmentId: number): string {
    return `${environment.apiBaseUrl}/v1/student-portal/doubts/attachments/${attachmentId}/content`;
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  goBack(): void { this.router.navigate(['/teacher/doubts']); }
}
