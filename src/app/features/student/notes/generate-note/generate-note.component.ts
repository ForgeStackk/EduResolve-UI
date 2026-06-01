import {
  Component, OnDestroy, OnInit, Input, Output, EventEmitter, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NotesApiService, PdfStatusResponse } from '../../../../core/api/notes-api.service';

type Step = 'source' | 'input' | 'streaming' | 'done' | 'error';

interface SourceType {
  key: string;
  icon: string;
  labelKey: string;
}

const SOURCE_TYPES: SourceType[] = [
  { key: 'TOPIC_INPUT', icon: 'edit',          labelKey: 'notes.source.TOPIC_INPUT' },
  { key: 'CHAPTER',     icon: 'menu_book',      labelKey: 'notes.source.CHAPTER'     },
  { key: 'PDF_UPLOAD',  icon: 'picture_as_pdf', labelKey: 'notes.source.PDF_UPLOAD'  },
  { key: 'VOICE',       icon: 'mic',            labelKey: 'notes.source.VOICE'       },
  { key: 'PHOTO_OCR',   icon: 'photo_camera',   labelKey: 'notes.source.PHOTO_OCR'   },
  { key: 'MANUAL',      icon: 'notes',          labelKey: 'notes.source.MANUAL'      },
];

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMAGE_BYTES      = 10 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES  = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg', 'audio/m4a'];
const MAX_AUDIO_BYTES      = 25 * 1024 * 1024;
const CHAR_LIMIT           = 10_000;

@Component({
  selector: 'app-generate-note',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './generate-note.component.html'
})
export class GenerateNoteComponent implements OnInit, OnDestroy {
  @Input() initialPrompt     = '';
  @Input() initialSourceType = 'TOPIC_INPUT';

  @Output() cancel = new EventEmitter<void>();
  @Output() done   = new EventEmitter<void>();

  private api = inject(NotesApiService);

  readonly sourcetypes = SOURCE_TYPES;
  readonly charLimit   = CHAR_LIMIT;

  step          = signal<Step>('source');
  sourceType    = signal('TOPIC_INPUT');
  language      = signal('en');
  prompt        = signal('');
  streamContent = signal('');
  errorMsg      = signal('');
  isGenerating  = signal(false);

  // PDF upload
  pdfFile    = signal<File | null>(null);
  pdfJobId   = signal<number | null>(null);
  pdfStatus  = signal<PdfStatusResponse | null>(null);
  pdfPolling = signal(false);

  // Image upload
  photoFile    = signal<File | null>(null);
  photoDataUrl = signal<string>('');
  inputError   = signal<string>('');
  isDragOver   = signal(false);

  // Audio upload / recording
  audioFile    = signal<File | null>(null);
  voiceTab     = signal<'record' | 'upload'>('record');
  isRecording  = signal(false);
  recordingSec = signal(0);

  private mediaRecorder?: MediaRecorder;
  private recordingChunks: Blob[] = [];
  private recordingTimer?: ReturnType<typeof setInterval>;

  readonly recordingTime = computed(() => {
    const s = this.recordingSec();
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  });

  // ── Computed ─────────────────────────────────────────────────────────────

  readonly charCount = computed(() => this.prompt().length);
  readonly charNearLimit = computed(() => this.charCount() > CHAR_LIMIT * 0.85);
  readonly charOverLimit = computed(() => this.charCount() > CHAR_LIMIT);

  readonly inputValid = computed(() => {
    switch (this.sourceType()) {
      case 'PDF_UPLOAD': return this.pdfStatus()?.status === 'COMPLETED';
      case 'PHOTO_OCR':  return !!this.photoFile() && !this.inputError();
      case 'VOICE':      return !!this.audioFile() && !this.inputError();
      default:           return this.prompt().trim().length > 2 && !this.charOverLimit();
    }
  });

  readonly disabledReason = computed(() => {
    if (this.inputValid()) return '';
    switch (this.sourceType()) {
      case 'PDF_UPLOAD':
        return this.pdfFile() ? 'Waiting for PDF to finish processing' : 'Select a PDF file first';
      case 'PHOTO_OCR':
        return this.inputError() || 'Select an image to continue';
      case 'VOICE':
        return this.inputError() || 'Select an audio file to continue';
      default:
        return this.charOverLimit()
          ? `Shorten your text — ${this.charCount()} / ${CHAR_LIMIT}`
          : 'Enter some text to generate notes';
    }
  });

  readonly generateAriaLabel = computed(() => {
    const map: Record<string, string> = {
      PDF_UPLOAD:  'Generate notes from PDF',
      PHOTO_OCR:   'Generate notes from image',
      TOPIC_INPUT: 'Generate notes from topic',
      CHAPTER:     'Generate notes from chapter',
      VOICE:       'Generate notes from audio',
      MANUAL:      'Generate notes',
    };
    return map[this.sourceType()] ?? 'Generate notes';
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (this.initialPrompt) {
      this.prompt.set(this.initialPrompt);
      this.sourceType.set(this.initialSourceType);
      this.step.set('input');
    }
  }

  // ── Source selection ──────────────────────────────────────────────────────

  selectSource(key: string): void {
    const prev = this.sourceType();
    if (prev !== key) {
      this.prompt.set('');
      this.pdfFile.set(null); this.pdfStatus.set(null);
      this.photoFile.set(null); this.photoDataUrl.set('');
      this.audioFile.set(null);
      this.inputError.set('');
    }
    if (key === 'VOICE') {
      this.mediaRecorder?.stop();
      clearInterval(this.recordingTimer);
      this.isRecording.set(false);
      this.voiceTab.set('record');
    }
    this.sourceType.set(key);
    this.step.set('input');
  }

  goBackToSource(): void {
    this.step.set('source');
    this.inputError.set('');
  }

  // ── PDF handling ──────────────────────────────────────────────────────────

  onPdfSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.uploadPdf(file);
  }

  private uploadPdf(file: File): void {
    this.pdfFile.set(file);
    this.pdfStatus.set(null);
    this.api.uploadPdf(file).subscribe({
      next: res => { this.pdfJobId.set(res.jobId); this.pollPdfStatus(res.jobId); },
      error: () => this.inputError.set('PDF upload failed')
    });
  }

  private pollPdfStatus(jobId: number): void {
    this.pdfPolling.set(true);
    this.pollTimer = setInterval(() => {
      this.api.pdfStatus(jobId).subscribe({
        next: s => {
          this.pdfStatus.set(s);
          if (s.status !== 'PROCESSING') { this.pdfPolling.set(false); clearInterval(this.pollTimer); }
        },
        error: () => { clearInterval(this.pollTimer); this.pdfPolling.set(false); }
      });
    }, 2000);
  }

  // ── Image handling (drag-and-drop + click) ────────────────────────────────

  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragOver.set(true); }
  onDragLeave(): void             { this.isDragOver.set(false); }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) this.setImageFile(file);
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.setImageFile(file);
  }

  private setImageFile(file: File): void {
    this.inputError.set('');
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      this.inputError.set('Unsupported file type. Use JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.inputError.set('Image must be under 10 MB.');
      return;
    }
    this.photoFile.set(file);
    const reader = new FileReader();
    reader.onload = e => this.photoDataUrl.set(e.target?.result as string ?? '');
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.photoFile.set(null);
    this.photoDataUrl.set('');
    this.inputError.set('');
  }

  onAudioSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.setAudioFile(file);
  }

  private setAudioFile(file: File): void {
    this.inputError.set('');
    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      this.inputError.set('Unsupported format. Use MP3, WAV, MP4, or WebM audio.');
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      this.inputError.set('Audio must be under 25 MB.');
      return;
    }
    this.audioFile.set(file);
  }

  removeAudio(): void {
    this.audioFile.set(null);
    this.inputError.set('');
  }

  async startRecording(): Promise<void> {
    this.inputError.set('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recordingChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      this.mediaRecorder.ondataavailable = e => { if (e.data.size > 0) this.recordingChunks.push(e.data); };
      this.mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(this.recordingTimer);
        const blob = new Blob(this.recordingChunks, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        this.audioFile.set(file);
        this.isRecording.set(false);
      };
      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.recordingSec.set(0);
      this.recordingTimer = setInterval(() => this.recordingSec.update(s => s + 1), 1000);
    } catch {
      this.inputError.set('Microphone access denied. Please allow microphone permission and try again.');
    }
  }

  stopRecording(): void {
    this.mediaRecorder?.stop();
  }

  formatFileSize(bytes: number): string {
    return bytes > 1_048_576
      ? (bytes / 1_048_576).toFixed(1) + ' MB'
      : (bytes / 1024).toFixed(0) + ' KB';
  }

  // ── Generation ────────────────────────────────────────────────────────────

  startGeneration(): void {
    if (!this.inputValid() || this.isGenerating()) return;

    this.isGenerating.set(true);
    this.step.set('streaming');
    this.streamContent.set('');
    this.errorMsg.set('');

    if (this.sourceType() === 'PHOTO_OCR') { this.startImageGeneration(); return; }
    if (this.sourceType() === 'VOICE')     { this.startAudioGeneration(); return; }

    const req: Parameters<NotesApiService['generateStream']>[0] = {
      sourceType: this.sourceType(),
      language:   this.language(),
      prompt:     this.prompt() || undefined,
      pdfJobId:   this.pdfJobId() ?? undefined,
    };

    this.cancelStream = this.api.generateStream(req, {
      onDelta: token => this.streamContent.update(c => c + token),
      onDone:  () => { this.step.set('done'); this.isGenerating.set(false); },
      onError: msg  => { this.errorMsg.set(msg); this.step.set('error'); this.isGenerating.set(false); }
    });
  }

  private startImageGeneration(): void {
    const file = this.photoFile()!;
    this.cancelStream = this.api.generateFromImage(file, this.language(), {
      onDelta: token => this.streamContent.update(c => c + token),
      onDone:  () => { this.step.set('done'); this.isGenerating.set(false); },
      onError: msg  => { this.errorMsg.set(msg); this.step.set('error'); this.isGenerating.set(false); }
    });
  }

  private startAudioGeneration(): void {
    const file = this.audioFile()!;
    this.cancelStream = this.api.generateFromAudio(file, this.language(), {
      onDelta: token => this.streamContent.update(c => c + token),
      onDone:  () => { this.step.set('done'); this.isGenerating.set(false); },
      onError: msg  => { this.errorMsg.set(msg); this.step.set('error'); this.isGenerating.set(false); }
    });
  }

  finishAndClose():  void { this.done.emit(); }

  retryGeneration(): void {
    this.step.set('input');
    this.errorMsg.set('');
    this.streamContent.set('');
    this.isGenerating.set(false);
  }

  private cancelStream?: () => void;
  private pollTimer?:    ReturnType<typeof setInterval>;

  ngOnDestroy(): void {
    this.cancelStream?.();
    clearInterval(this.pollTimer);
    this.mediaRecorder?.stop();
    clearInterval(this.recordingTimer);
  }
}
