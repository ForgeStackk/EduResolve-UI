import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Difficulty, GeneratedQuiz, QuizGeneratorApiService } from '../../../core/api/quiz-generator-api.service';
import { LanguageService } from '../../../core/i18n/language.service';

interface Option { id: string; text: string; }

@Component({
  selector: 'app-quiz-runner',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './quiz-runner.component.html',
  styleUrl: './quiz-runner.component.css'
})
export class QuizRunnerComponent implements OnInit, OnDestroy {
  private api = inject(QuizGeneratorApiService);
  private route = inject(ActivatedRoute);
  protected lang = inject(LanguageService);

  difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];

  chapterId = signal<number | null>(null);
  difficulty = signal<Difficulty>('MEDIUM');
  count = signal(5);

  phase = signal<'config' | 'taking' | 'results'>('config');
  quiz = signal<GeneratedQuiz | null>(null);
  currentIndex = signal(0);
  /** questionId -> selected optionId */
  answers = signal<Record<number, string>>({});

  /** Timer */
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

  score = computed(() => this.breakdown().filter(b => b.correct).length);

  breakdown = computed(() => {
    const q = this.quiz(); if (!q) return [];
    return q.questions.map(qq => ({
      question: qq,
      correct: this.answers()[qq.id] != null && this.answers()[qq.id] === qq.correctOptionId
    }));
  });

  ngOnInit() {
    const cid = this.route.snapshot.queryParamMap.get('chapterId');
    if (cid) this.chapterId.set(Number(cid));
  }

  ngOnDestroy() { this.clearTimer(); }

  generate() {
    if (!this.chapterId()) return;
    this.api.generate({
      chapterId: this.chapterId()!,
      difficulty: this.difficulty(),
      language: this.lang.current(),
      count: this.count()
    }).subscribe(res => {
      if (!res.questions.length) return;
      this.quiz.set(res);
      this.currentIndex.set(0);
      this.answers.set({});
      this.remainingSeconds.set(res.recommendedDurationSeconds);
      this.phase.set('taking');
      this.startTimer();
    });
  }

  selectAnswer(qid: number, optionId: string) {
    this.answers.update(prev => ({ ...prev, [qid]: optionId }));
  }

  next() { this.currentIndex.update(i => i + 1); }
  prev() { this.currentIndex.update(i => Math.max(0, i - 1)); }

  submit() {
    this.clearTimer();
    this.phase.set('results');
  }

  reset() {
    this.clearTimer();
    this.quiz.set(null);
    this.answers.set({});
    this.currentIndex.set(0);
    this.phase.set('config');
  }

  formatTime(s: number): string {
    const mm = Math.floor(s / 60); const ss = s % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }

  private startTimer() {
    this.clearTimer();
    this.timerHandle = setInterval(() => {
      const r = this.remainingSeconds();
      if (r <= 1) { this.submit(); return; }
      this.remainingSeconds.set(r - 1);
    }, 1000);
  }
  private clearTimer() { if (this.timerHandle) { clearInterval(this.timerHandle); this.timerHandle = null; } }
}
