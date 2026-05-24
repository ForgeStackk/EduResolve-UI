import {
  Component, Input, Output, EventEmitter, inject, signal, computed, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { retry, timer } from 'rxjs';
import { MessagesService } from '../../../messages/messages.service';
import { HomeworkService } from '../../../homework/homework.service';
import { RecipientType, SendMessageResponse } from '../../models/teacher-portal.models';
import { VoiceRecorderComponent } from '../voice-recorder/voice-recorder.component';

const MAX_IMAGE_BYTES = 5  * 1024 * 1024;   // 5 MB
const MAX_FILE_BYTES  = 25 * 1024 * 1024;   // 25 MB

@Component({
  selector: 'app-message-composer',
  standalone: true,
  imports: [CommonModule, TranslateModule, VoiceRecorderComponent],
  templateUrl: './message-composer.component.html'
})
export class MessageComposerComponent implements OnDestroy {
  private msgSvc    = inject(MessagesService);
  private hwSvc     = inject(HomeworkService);
  private translate = inject(TranslateService);

  // ── Inputs ──────────────────────────────────────────────────────────────
  @Input({ required: true }) classId!: string;
  @Input() subjectId:          string | null = null;
  @Input() recipientType:      RecipientType = 'CLASS';
  @Input() recipientLabel:     string        = 'Class';
  @Input() showRecipientBadge: boolean       = true;
  @Input() showDueDatePicker:  boolean       = false;
  @Input() placeholder:        string        = 'Type your message…';
  @Input() submitLabel:        string        = 'Send Message';
  /** File-input accept attribute — e.g. ".pdf,.docx,.zip" or "*" */
  @Input() fileAccept:         string        = '*';
  /** Max number of file attachments (not counting images or voice). */
  @Input() maxFiles:           number        = 10;
  /** Show a camera-capture button alongside the gallery picker (for mobile). */
  @Input() showCameraCapture:  boolean       = false;

  @Output() messageSent = new EventEmitter<SendMessageResponse>();

  // ── State ────────────────────────────────────────────────────────────────
  textBody    = signal('');
  voiceBlob   = signal<Blob | null>(null);
  images      = signal<File[]>([]);
  files       = signal<File[]>([]);
  dueDate     = signal('');
  isDragging  = signal(false);
  lightboxUrl = signal<string | null>(null);

  sending = signal(false);
  sent    = signal<number | null>(null);
  error   = signal<string | null>(null);

  /** Parallel array of ObjectURLs for image thumbnails — revoked on remove / destroy. */
  private previewUrls: string[] = [];
  imagePreviews = signal<{ url: string; name: string; size: number }[]>([]);

  hasContent  = computed(() =>
    this.textBody().trim().length > 0 ||
    this.voiceBlob() !== null ||
    this.images().length > 0 ||
    this.files().length > 0
  );
  filesAtLimit = computed(() => this.files().length >= this.maxFiles);
  today        = new Date().toISOString().split('T')[0];

  // ── Attachment handlers ──────────────────────────────────────────────────

  onVoiceRecorded(blob: Blob | null): void {
    this.voiceBlob.set(blob);
  }

  addImages(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) this.ingestImages(Array.from(files));
    (event.target as HTMLInputElement).value = '';
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files) this.ingestImages(Array.from(files));
  }

  private ingestImages(incoming: File[]): void {
    this.error.set(null);
    for (const f of incoming) {
      if (!f.type.startsWith('image/')) { this.error.set(this.translate.instant('teacher.composerError.notAnImage', { name: f.name })); continue; }
      if (f.size > MAX_IMAGE_BYTES)     { this.error.set(this.translate.instant('teacher.composerError.imageTooLarge', { name: f.name })); continue; }
      const url = URL.createObjectURL(f);
      this.previewUrls.push(url);
      this.images.update(a => [...a, f]);
      this.imagePreviews.update(a => [...a, { url, name: f.name, size: f.size }]);
    }
  }

  removeImage(index: number): void {
    URL.revokeObjectURL(this.previewUrls[index]);
    this.previewUrls.splice(index, 1);
    this.images.update(a => a.filter((_, i) => i !== index));
    this.imagePreviews.update(a => a.filter((_, i) => i !== index));
  }

  openLightbox(url: string): void  { this.lightboxUrl.set(url); }
  closeLightbox(): void            { this.lightboxUrl.set(null); }

  addFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.error.set(null);
    for (const f of Array.from(input.files)) {
      if (this.files().length >= this.maxFiles) {
        this.error.set(this.translate.instant('teacher.composerError.maxFiles', { max: this.maxFiles }));
        break;
      }
      if (f.size > MAX_FILE_BYTES) { this.error.set(this.translate.instant('teacher.composerError.fileTooLarge', { name: f.name })); continue; }
      this.files.update(a => [...a, f]);
    }
    input.value = '';
  }

  removeFile(index: number): void {
    this.files.update(a => a.filter((_, i) => i !== index));
  }

  // ── Send ─────────────────────────────────────────────────────────────────

  send(): void {
    if (!this.hasContent()) return;
    if (this.showDueDatePicker && !this.dueDate()) {
      this.error.set(this.translate.instant('teacher.composerError.dueDate'));
      return;
    }

    this.sending.set(true);
    this.sent.set(null);
    this.error.set(null);

    const fd = new FormData();
    fd.append('targetClassId', this.classId);
    fd.append('recipientType', this.recipientType);
    if (this.subjectId)           fd.append('targetSubjectId', this.subjectId);
    if (this.textBody().trim())   fd.append('textBody', this.textBody().trim());
    if (this.voiceBlob())         fd.append('voiceNote', this.voiceBlob()!, 'voice.webm');
    this.images().forEach(f      => fd.append('images', f));
    this.files().forEach(f       => fd.append('files', f));
    if (this.showDueDatePicker) {
      fd.append('isHomework', 'true');
      if (this.dueDate()) fd.append('homeworkDueDate', this.dueDate());
    }

    // Retry up to 2 times with exponential backoff (1 s → 2 s) before giving up.
    const call = this.showDueDatePicker ? this.hwSvc.send(fd) : this.msgSvc.send(fd);
    call.pipe(
      retry({
        count: 2,
        delay: (_err: unknown, retryCount: number) => timer(1000 * Math.pow(2, retryCount - 1))
      })
    ).subscribe({
      next: res => {
        this.sent.set(res.deliveredTo);
        this.sending.set(false);
        this.messageSent.emit(res);
        this.resetForm();
      },
      error: () => {
        // Files are intentionally NOT reset — teacher can retry without re-selecting.
        const attachmentNames = [...this.images(), ...this.files()].map(f => f.name).join(', ');
        this.error.set(
          attachmentNames
            ? this.translate.instant('teacher.composerError.uploadFailed', { names: attachmentNames })
            : this.translate.instant('teacher.composerError.sendFailed')
        );
        this.sending.set(false);
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  formatBytes(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private resetForm(): void {
    this.textBody.set('');
    this.voiceBlob.set(null);
    this.dueDate.set('');
    this.revokeAllPreviews();
    this.images.set([]);
    this.files.set([]);
    this.imagePreviews.set([]);
  }

  private revokeAllPreviews(): void {
    this.previewUrls.forEach(u => URL.revokeObjectURL(u));
    this.previewUrls = [];
  }

  ngOnDestroy(): void {
    this.revokeAllPreviews();
  }
}
