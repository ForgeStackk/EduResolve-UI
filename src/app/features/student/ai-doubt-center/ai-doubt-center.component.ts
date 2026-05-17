import {
  Component, HostListener, Input, OnDestroy, OnInit, computed, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoubtSolverApiService, DoubtAnswer } from '../../../core/api/doubt-solver-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SubjectCatalogService } from '../../../core/subject-catalog.service';

export type InputMode = 'text' | 'image' | 'voice';

@Component({
  selector: 'app-ai-doubt-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-doubt-center.component.html',
  styleUrl: './ai-doubt-center.component.css'
})
export class AiDoubtCenterComponent implements OnInit, OnDestroy {
  @Input() grade = '9';

  private doubtApi = inject(DoubtSolverApiService);
  private auth     = inject(AuthService);
  readonly catalog  = inject(SubjectCatalogService);

  isOpen          = signal(false);
  mode            = signal<InputMode>('text');
  queryText       = '';
  selectedSubject = '';
  isLoading       = signal(false);
  response        = signal<DoubtAnswer | null>(null);
  voiceActive     = signal(false);
  imagePreview    = signal<string | null>(null);
  imageFile       = signal<File | null>(null);
  errorMsg        = signal('');
  earnedPoints    = signal<number | null>(null);

  readonly subjects        = computed(() => this.catalog.subjects());
  readonly subjectsLoading = computed(() => this.catalog.loading());

  private recognition: any = null;

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user?.grade) this.grade = user.grade;
    this.catalog.load();
  }

  ngOnDestroy(): void {
    this.recognition?.stop();
  }

  togglePanel(): void {
    this.isOpen.update(v => !v);
    if (!this.isOpen()) this.reset();
  }

  selectMode(m: InputMode): void {
    this.mode.set(m);
    this.queryText = '';
    this.imagePreview.set(null);
    this.errorMsg.set('');
    if (m === 'voice') this.startVoice();
  }

  startVoice(): void {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      this.errorMsg.set('Voice recognition is not supported in this browser. Try Chrome.');
      return;
    }
    this.recognition = new SR();
    this.recognition.lang         = 'en-IN';
    this.recognition.interimResults = false;
    this.recognition.continuous   = false;
    this.recognition.onstart  = () => this.voiceActive.set(true);
    this.recognition.onend    = () => {
      this.voiceActive.set(false);
      if (this.queryText.trim()) setTimeout(() => this.sendQuery(), 800);
    };
    this.recognition.onerror  = () => {
      this.voiceActive.set(false);
      this.errorMsg.set('Voice capture failed. Please try again.');
    };
    this.recognition.onresult = (event: any) => {
      this.queryText = event.results[0][0].transcript;
    };
    this.recognition.start();
  }

  onImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imageFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  sendQuery(): void {
    if (this.isLoading()) return;

    if (this.mode() === 'image' && this.imageFile()) {
      this.sendImageQuery();
      return;
    }

    const q = this.queryText.trim();
    if (!q) return;

    this.isLoading.set(true);
    this.response.set(null);
    this.errorMsg.set('');
    this.earnedPoints.set(null);

    const subjectCtx = this.selectedSubject ? ` studying ${this.selectedSubject}` : '';
    const classAwareQuery = `I am a Class ${this.grade} student${subjectCtx}. Please use vocabulary and examples suitable for a ${this.grade}th-grade student. Question: ${q}`;
    const studentId = this.auth.currentUser()?.studentId;

    this.doubtApi.ask(classAwareQuery, 'en', this.selectedSubject || undefined, studentId).subscribe({
      next: (ans) => { this.response.set(ans); this.isLoading.set(false); },
      error: () => {
        this.errorMsg.set('Could not reach the AI engine. Check your connection and try again.');
        this.isLoading.set(false);
      }
    });
  }

  private sendImageQuery(): void {
    this.isLoading.set(true);
    this.response.set(null);
    this.errorMsg.set('');
    this.earnedPoints.set(null);

    const studentId = this.auth.currentUser()?.studentId;
    const subjectCtx = this.selectedSubject ? ` studying ${this.selectedSubject}` : '';
    const q = this.queryText.trim() || `I am a Class ${this.grade} student${subjectCtx}. Please explain this image.`;

    this.doubtApi.askWithImage(this.imageFile()!, q, 'en', this.selectedSubject || undefined, studentId).subscribe({
      next: (ans) => { this.response.set(ans); this.isLoading.set(false); },
      error: () => {
        this.errorMsg.set('Could not analyze the image. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  clearImage(): void {
    this.imagePreview.set(null);
    this.imageFile.set(null);
    this.queryText = '';
  }

  reset(): void {
    this.queryText = '';
    this.selectedSubject = '';
    this.response.set(null);
    this.imagePreview.set(null);
    this.imageFile.set(null);
    this.errorMsg.set('');
    this.isLoading.set(false);
    this.earnedPoints.set(null);
    this.mode.set('text');
    this.recognition?.stop();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.togglePanel();
  }
}
