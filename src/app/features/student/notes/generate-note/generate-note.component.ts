import {
  Component, OnDestroy, OnInit, Input, Output, EventEmitter, inject, signal
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
  { key: 'TOPIC_INPUT', icon: 'edit',            labelKey: 'notes.source.TOPIC_INPUT' },
  { key: 'CHAPTER',     icon: 'menu_book',        labelKey: 'notes.source.CHAPTER'     },
  { key: 'PDF_UPLOAD',  icon: 'picture_as_pdf',   labelKey: 'notes.source.PDF_UPLOAD'  },
  { key: 'VOICE',       icon: 'mic',              labelKey: 'notes.source.VOICE'       },
  { key: 'PHOTO_OCR',   icon: 'photo_camera',     labelKey: 'notes.source.PHOTO_OCR'   },
  { key: 'MANUAL',      icon: 'notes',            labelKey: 'notes.source.MANUAL'      },
];

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

  step          = signal<Step>('source');
  sourceType    = signal('TOPIC_INPUT');
  language      = signal('en');
  prompt        = signal('');
  streamContent = signal('');
  errorMsg      = signal('');

  pdfFile       = signal<File | null>(null);
  pdfJobId      = signal<number | null>(null);
  pdfStatus     = signal<PdfStatusResponse | null>(null);
  pdfPolling    = signal(false);

  private cancelStream?: () => void;
  private pollTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    if (this.initialPrompt) {
      this.prompt.set(this.initialPrompt);
      this.sourceType.set(this.initialSourceType);
      this.step.set('input');
    }
  }

  // ── Step 1: choose source ─────────────────────────────────────────────────

  selectSource(key: string): void {
    this.sourceType.set(key);
    this.step.set('input');
  }

  // ── Step 2: language + input ──────────────────────────────────────────────

  onPdfSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.pdfFile.set(file);
    this.uploadPdf(file);
  }

  private uploadPdf(file: File): void {
    this.pdfStatus.set(null);
    this.api.uploadPdf(file).subscribe({
      next: res => {
        this.pdfJobId.set(res.jobId);
        this.pollPdfStatus(res.jobId);
      },
      error: () => this.errorMsg.set('PDF upload failed')
    });
  }

  private pollPdfStatus(jobId: number): void {
    this.pdfPolling.set(true);
    this.pollTimer = setInterval(() => {
      this.api.pdfStatus(jobId).subscribe({
        next: s => {
          this.pdfStatus.set(s);
          if (s.status !== 'PROCESSING') {
            this.pdfPolling.set(false);
            clearInterval(this.pollTimer);
          }
        },
        error: () => { clearInterval(this.pollTimer); this.pdfPolling.set(false); }
      });
    }, 2000);
  }

  canGenerate(): boolean {
    if (this.sourceType() === 'PDF_UPLOAD') {
      return this.pdfStatus()?.status === 'COMPLETED';
    }
    return this.prompt().trim().length > 2;
  }

  // ── Step 3: stream ────────────────────────────────────────────────────────

  startGeneration(): void {
    this.step.set('streaming');
    this.streamContent.set('');
    this.errorMsg.set('');

    const req: Parameters<NotesApiService['generateStream']>[0] = {
      sourceType: this.sourceType(),
      language:   this.language(),
      prompt:     this.prompt() || undefined,
      pdfJobId:   this.pdfJobId() ?? undefined,
    };

    this.cancelStream = this.api.generateStream(req, {
      onDelta: token => this.streamContent.update(c => c + token),
      onDone:  () => this.step.set('done'),
      onError: msg => { this.errorMsg.set(msg); this.step.set('error'); }
    });
  }

  finishAndClose(): void {
    this.done.emit();
  }

  retryGeneration(): void {
    this.step.set('input');
    this.errorMsg.set('');
    this.streamContent.set('');
  }

  ngOnDestroy(): void {
    this.cancelStream?.();
    clearInterval(this.pollTimer);
  }
}
