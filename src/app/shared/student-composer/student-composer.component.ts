import {
  Component, Input, Output, EventEmitter, inject, signal, computed, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceRecorderComponent } from '../../features/teacher-portal/shared/components/voice-recorder/voice-recorder.component';

const MAX_IMAGE_BYTES = 5  * 1024 * 1024;
const MAX_FILE_BYTES  = 25 * 1024 * 1024;

@Component({
  selector: 'app-student-composer',
  standalone: true,
  imports: [CommonModule, VoiceRecorderComponent],
  templateUrl: './student-composer.component.html',
})
export class StudentComposerComponent implements OnDestroy {
  @Input() placeholder  = 'Type your message…';
  @Input() submitLabel  = 'Send';
  @Input() maxFiles     = 5;
  @Input() fileAccept   = '*';
  /** Parent sets this to true while its HTTP call is in flight. */
  @Input() set isSending(v: boolean) { this.sending.set(v); }
  /** Parent pushes error text here (null to clear). */
  @Input() set serverError(v: string | null) { if (v) this.error.set(v); }

  /** Emits FormData — parent is responsible for the HTTP call. */
  @Output() submitted = new EventEmitter<FormData>();

  textBody    = signal('');
  voiceBlob   = signal<Blob | null>(null);
  images      = signal<File[]>([]);
  files       = signal<File[]>([]);
  isDragging  = signal(false);
  lightboxUrl = signal<string | null>(null);
  sending     = signal(false);
  error       = signal<string | null>(null);

  private previewUrls: string[] = [];
  imagePreviews = signal<{ url: string; name: string; size: number }[]>([]);

  hasContent   = computed(() =>
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
      if (!f.type.startsWith('image/')) { this.error.set(`${f.name} is not an image.`); continue; }
      if (f.size > MAX_IMAGE_BYTES)     { this.error.set(`${f.name} exceeds 5 MB.`);    continue; }
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
        this.error.set(`Maximum ${this.maxFiles} file(s) allowed.`);
        break;
      }
      if (f.size > MAX_FILE_BYTES) { this.error.set(`${f.name} exceeds 25 MB.`); continue; }
      this.files.update(a => [...a, f]);
    }
    input.value = '';
  }

  removeFile(index: number): void {
    this.files.update(a => a.filter((_, i) => i !== index));
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  submit(): void {
    if (!this.hasContent() || this.sending()) return;
    this.error.set(null);

    const fd = new FormData();
    if (this.textBody().trim()) fd.append('textBody', this.textBody().trim());
    if (this.voiceBlob())       fd.append('voiceNote', this.voiceBlob()!, 'voice.webm');
    this.images().forEach(f    => fd.append('images', f));
    this.files().forEach(f     => fd.append('files', f));

    this.submitted.emit(fd);
  }

  /** Called by parent after a successful send. */
  reset(): void {
    this.textBody.set('');
    this.voiceBlob.set(null);
    this.revokeAllPreviews();
    this.images.set([]);
    this.files.set([]);
    this.imagePreviews.set([]);
    this.error.set(null);
  }

  formatBytes(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private revokeAllPreviews(): void {
    this.previewUrls.forEach(u => URL.revokeObjectURL(u));
    this.previewUrls = [];
  }

  ngOnDestroy(): void {
    this.revokeAllPreviews();
  }
}
