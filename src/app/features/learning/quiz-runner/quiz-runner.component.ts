import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Difficulty, GeneratedQuiz } from '../../../core/api/quiz-generator-api.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { NcertApiService, NCERTBook, NCERTChapter } from '../../../core/api/ncert-api.service';
import { ClassContextService } from '../../../core/class-context.service';
import { SubjectCatalogService } from '../../../core/subject-catalog.service';

interface Option { id: string; text: string; }

@Component({
  selector: 'app-quiz-runner',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './quiz-runner.component.html',
  styleUrl: './quiz-runner.component.css'
})
export class QuizRunnerComponent implements OnInit, OnDestroy {
  private ncertApi  = inject(NcertApiService);
  private route     = inject(ActivatedRoute);
  private location  = inject(Location);
  private classCtx  = inject(ClassContextService);
  readonly catalog  = inject(SubjectCatalogService);
  protected lang    = inject(LanguageService);

  difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];

  // ── Chapter selection ────────────────────────────────────────
  selectedSubject      = signal<string>('');
  books                = signal<NCERTBook[]>([]);
  chapters             = signal<NCERTChapter[]>([]);
  booksLoading         = signal(false);
  chaptersLoading      = signal(false);
  generating           = signal(false);
  errorMsg             = signal<string>('');

  chapterId            = signal<number | null>(null);
  selectedChapterTitle = signal<string>('');

  // ── Quiz config ──────────────────────────────────────────────
  difficulty = signal<Difficulty>('MEDIUM');

  count = computed(() => {
    const d = this.difficulty();
    return d === 'EASY' ? 10 : d === 'HARD' ? 5 : 7;
  });

  // ── Quiz state ───────────────────────────────────────────────
  phase            = signal<'config' | 'taking' | 'results'>('config');
  quiz             = signal<GeneratedQuiz | null>(null);
  currentIndex     = signal(0);
  answers          = signal<Record<number, string>>({});
  remainingSeconds = signal(0);
  private timerHandle: any;

  currentQuestion = computed(() => {
    const q = this.quiz(); if (!q) return null;
    return q.questions[this.currentIndex()] ?? null;
  });

  currentOptions = computed<Option[]>(() => {
    const q = this.currentQuestion(); if (!q?.optionsJson) return [];
    try { return JSON.parse(q.optionsJson) as Option[]; } catch { return []; }
  });

  score     = computed(() => this.breakdown().filter(b => b.correct).length);
  breakdown = computed(() => {
    const q = this.quiz(); if (!q) return [];
    return q.questions.map(qq => ({
      question: qq,
      correct: this.answers()[qq.id] != null && this.answers()[qq.id] === qq.correctOptionId,
    }));
  });

  ngOnInit() {
    this.catalog.load();
    const cid   = this.route.snapshot.queryParamMap.get('chapterId');
    const title = this.route.snapshot.queryParamMap.get('chapterTitle');
    if (cid) {
      this.chapterId.set(Number(cid));
      if (title) this.selectedChapterTitle.set(title);
    }
  }

  ngOnDestroy() { this.clearTimer(); }

  // ── Selection handlers ───────────────────────────────────────

  onSubjectChange(subject: string) {
    this.selectedSubject.set(subject);
    this.chapterId.set(null);
    this.books.set([]);
    this.chapters.set([]);
    this.errorMsg.set('');
    if (!subject) return;
    this.booksLoading.set(true);
    this.ncertApi.getBooks(this.classCtx.grade(), subject).subscribe({
      next: books => {
        this.books.set(books);
        this.booksLoading.set(false);
        if (books.length === 1) this.onBookChange(books[0].id);
      },
      error: () => this.booksLoading.set(false),
    });
  }

  onBookChange(bookId: number) {
    this.chapterId.set(null);
    this.selectedChapterTitle.set('');
    this.chapters.set([]);
    if (!bookId) return;
    const book = this.books().find(b => b.id === bookId);
    this.chaptersLoading.set(true);
    this.ncertApi.getChapters(bookId).subscribe({
      next: chapters => {
        this.chaptersLoading.set(false);
        if (chapters.length > 0) {
          const last = chapters[chapters.length - 1];
          this.chapterId.set(last.id);
        } else {
          this.chapterId.set(bookId);
        }
        this.selectedChapterTitle.set(book?.title ?? `Book ${bookId}`);
      },
      error: () => {
        this.chaptersLoading.set(false);
        this.chapterId.set(bookId);
        this.selectedChapterTitle.set(book?.title ?? `Book ${bookId}`);
      },
    });
  }

  onChapterSelect(chapter: NCERTChapter) {
    this.chapterId.set(chapter.id);
    this.selectedChapterTitle.set(chapter.title || `Chapter ${chapter.chapterNumber}`);
  }

  clearChapter() {
    this.chapterId.set(null);
    this.selectedChapterTitle.set('');
  }

  // ── Quiz generation ──────────────────────────────────────────

  generate() {
    if (!this.chapterId()) return;
    this.generating.set(true);
    this.errorMsg.set('');

    this.ncertApi.generateQuiz(
      this.difficulty().toLowerCase(),
      this.count(),
      this.chapterId()!,
    ).subscribe({
      next: (ncertQuestions) => {
        this.generating.set(false);
        if (!ncertQuestions?.length) {
          this.errorMsg.set('quiz.noQuestions');
          return;
        }
        const quiz: GeneratedQuiz = {
          chapterId: this.chapterId()!,
          language: this.lang.current(),
          requested: this.count(),
          returned: ncertQuestions.length,
          recommendedDurationSeconds: ncertQuestions.length * 90,
          questions: ncertQuestions.map((q, idx) => ({
            id: q.id ?? (idx + 1),
            text: q.questionText,
            optionsJson: JSON.stringify([
              { id: 'A', text: q.optionA },
              { id: 'B', text: q.optionB },
              { id: 'C', text: q.optionC },
              { id: 'D', text: q.optionD },
            ]),
            correctOptionId: q.correctOption,
            explanation: q.explanation,
          })),
        };
        this.quiz.set(quiz);
        this.currentIndex.set(0);
        this.answers.set({});
        this.remainingSeconds.set(quiz.recommendedDurationSeconds);
        this.phase.set('taking');
        this.startTimer();
      },
      error: () => {
        this.generating.set(false);
        this.errorMsg.set('quiz.noQuestions');
      },
    });
  }

  selectAnswer(qid: number, optionId: string) {
    this.answers.update(prev => ({ ...prev, [qid]: optionId }));
  }

  next()   { this.currentIndex.update(i => i + 1); }
  prev()   { this.currentIndex.update(i => Math.max(0, i - 1)); }
  submit() { this.clearTimer(); this.phase.set('results'); }

  reset() {
    this.clearTimer();
    this.quiz.set(null);
    this.answers.set({});
    this.currentIndex.set(0);
    this.errorMsg.set('');
    this.phase.set('config');
  }

  formatTime(s: number): string {
    const mm = Math.floor(s / 60); const ss = s % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }

  back(): void { this.location.back(); }

  private startTimer() {
    this.clearTimer();
    this.timerHandle = setInterval(() => {
      const r = this.remainingSeconds();
      if (r <= 1) { this.submit(); return; }
      this.remainingSeconds.set(r - 1);
    }, 1000);
  }

  private clearTimer() {
    if (this.timerHandle) { clearInterval(this.timerHandle); this.timerHandle = null; }
  }
}
