import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { StudentApiService, StudentProfile } from '../../../core/api/student-api.service';
import { LearningApiService, Subject, Chapter } from '../../../core/api/learning-api.service';
import { PerformanceApiService, WeakTopic } from '../../../core/api/performance-api.service';
import { AuthService, MOCK_STUDENT_PROFILE } from '../../../core/auth/auth.service';

interface DailyPlanItem {
  chapterId: number;
  title: string;
  subject: string;
  minutes: number;
  done: boolean;
}

/** Subject -> HUD accent color (mirrors high_energy_hud spec). */
const SUBJECT_ACCENT: Record<string, string> = {
  physics:  '#3b82f6',
  math:     '#8b5cf6',
  mathematics: '#8b5cf6',
  chemistry:'#10b981',
  biology:  '#10b981',
  english:  '#ec4899',
  literature:'#ec4899',
  computer: '#f59e0b',
  history:  '#f59e0b',
  geography:'#22d3ee'
};

const SUBJECT_ICON: Record<string, string> = {
  physics:  'biotech',
  math:     'functions',
  mathematics: 'functions',
  chemistry:'science',
  biology:  'eco',
  english:  'menu_book',
  literature: 'menu_book',
  computer: 'memory',
  history:  'history_edu',
  geography:'public'
};

interface WeakTopicView {
  id: number;
  topicId: number;
  topicName?: string;
  subject?: string;
  accuracy: number;
}

/** XP thresholds for ranks. Index = rank tier. */
const RANK_TIERS: { label: string; minXp: number }[] = [
  { label: 'Beginner',    minXp: 0 },
  { label: 'Apprentice',  minXp: 100 },
  { label: 'Scholar',     minXp: 300 },
  { label: 'Expert',      minXp: 700 },
  { label: 'Master',      minXp: 1500 }
];

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  private studentApi = inject(StudentApiService);
  private learningApi = inject(LearningApiService);
  private performanceApi = inject(PerformanceApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  /** Profile metrics (defaults shown until API resolves). */
  studentId = signal<number | null>(null);
  studentName = signal<string>('');
  className = signal<string>('');
  initials = signal<string>('');
  grade = signal<string>('');
  streakDays = signal(0);
  experiencePoints = signal(0);
  topPercentage = signal(0);

  /** Loaded learning content. */
  private subjects = signal<Subject[]>([]);
  private chapters = signal<Chapter[]>([]);
  private weakTopicsRaw = signal<WeakTopic[]>([]);

  firstName = computed(() => this.studentName().split(' ')[0] || '');

  /** Index subjects by id for quick name lookup. */
  private subjectById = computed(() => {
    const map = new Map<number, Subject>();
    for (const s of this.subjects()) map.set(s.id, s);
    return map;
  });

  /** Pick the first chapter as the "continue learning" target. */
  recommendedChapter = computed<Chapter | null>(() => this.chapters()[0] ?? null);

  recommendedSubjectName = computed(() => {
    const c = this.recommendedChapter();
    if (!c) return '';
    return this.subjectById().get(c.subjectId)?.name ?? '';
  });

  /** Use weakest-topic accuracy on the recommended chapter, if any. */
  recommendedAccuracy = computed<number | null>(() => {
    const wt = this.weakTopicsRaw()[0];
    return wt ? Math.round(wt.accuracy) : null;
  });

  recommendedProgressPercent = computed(() => {
    const acc = this.recommendedAccuracy();
    return acc == null ? 0 : Math.max(0, Math.min(100, acc));
  });

  /** Manual completion toggles for the daily directives checklist. */
  private completed = signal<Record<number, boolean>>({});

  /** Build a small "daily plan" from the first few chapters. */
  dailyPlan = computed<DailyPlanItem[]>(() => {
    const subjMap = this.subjectById();
    const done = this.completed();
    return this.chapters().slice(0, 3).map(c => ({
      chapterId: c.id,
      title: c.name,
      subject: subjMap.get(c.subjectId)?.name ?? 'Subject',
      minutes: c.estimatedMinutes ?? 15,
      done: !!done[c.id]
    }));
  });

  weakTopics = computed<WeakTopicView[]>(() => {
    return this.weakTopicsRaw().slice(0, 4).map(w => ({
      id: w.id,
      topicId: w.topicId,
      accuracy: Math.round(w.accuracy)
    }));
  });

  /** Subject focus chips - first four subjects, with active = first one. */
  focusChips = computed(() => {
    const list = this.subjects().slice(0, 4);
    return list.map((s, idx) => ({
      id: s.id,
      name: s.name,
      icon: this.subjectIconFor(s.name),
      active: idx === 0
    }));
  });

  subjectAccent(name: string | undefined): string {
    if (!name) return '#dc2626';
    const k = name.toLowerCase();
    for (const key of Object.keys(SUBJECT_ACCENT)) {
      if (k.includes(key)) return SUBJECT_ACCENT[key];
    }
    return '#dc2626';
  }
  subjectIconFor(name: string | undefined): string {
    if (!name) return 'school';
    const k = name.toLowerCase();
    for (const key of Object.keys(SUBJECT_ICON)) {
      if (k.includes(key)) return SUBJECT_ICON[key];
    }
    return 'school';
  }
  toggleDirective(chapterId: number): void {
    this.completed.update(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  }

  /** Rank progression based on XP. */
  private currentRankIndex = computed(() => {
    const xp = this.experiencePoints();
    let idx = 0;
    for (let i = 0; i < RANK_TIERS.length; i++) {
      if (xp >= RANK_TIERS[i].minXp) idx = i;
    }
    return idx;
  });

  rankLabel = computed(() => RANK_TIERS[this.currentRankIndex()].label);

  nextRankLabel = computed(() => {
    const i = this.currentRankIndex();
    return i + 1 < RANK_TIERS.length ? RANK_TIERS[i + 1].label : RANK_TIERS[i].label;
  });

  xpToNextRank = computed(() => {
    const i = this.currentRankIndex();
    if (i + 1 >= RANK_TIERS.length) return 0;
    return Math.max(0, RANK_TIERS[i + 1].minXp - this.experiencePoints());
  });

  xpProgressPercent = computed(() => {
    const i = this.currentRankIndex();
    if (i + 1 >= RANK_TIERS.length) return 100;
    const cur = RANK_TIERS[i].minXp;
    const next = RANK_TIERS[i + 1].minXp;
    const span = next - cur;
    if (span <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round(((this.experiencePoints() - cur) / span) * 100)));
  });

  ngOnInit(): void {
    // Seed UI immediately from the mock profile so the HUD has data on
    // first paint even if the backend is offline.
    this.applyProfile(MOCK_STUDENT_PROFILE as unknown as StudentProfile);

    const id = this.auth.currentStudentId();
    if (id == null) {
      this.loadLearningData(MOCK_STUDENT_PROFILE.grade, MOCK_STUDENT_PROFILE.id);
      return;
    }
    this.studentApi.getById(id).subscribe({
      next: me => {
        this.applyProfile(me);
        this.loadLearningData(me.grade, me.id);
      },
      error: err => {
        console.error('Student profile load failed - using mock', err);
        this.loadLearningData(MOCK_STUDENT_PROFILE.grade, MOCK_STUDENT_PROFILE.id);
      }
    });
  }

  private applyProfile(me: StudentProfile): void {
    this.studentId.set(me.id);
    this.studentName.set(me.name ?? '');
    this.className.set(me.className ?? '');
    this.initials.set(me.initials ?? '');
    this.grade.set(me.grade ?? '');
    this.streakDays.set(me.streakDays ?? 0);
    this.experiencePoints.set(me.experiencePoints ?? 0);
    this.topPercentage.set(me.topPercentage ?? 0);
  }

  private loadLearningData(grade: string | undefined, studentId: number | undefined): void {
    forkJoin({
      subjects: this.learningApi.listSubjects(grade).pipe(catchError(() => of([] as Subject[]))),
      chapters: this.learningApi.listChapters().pipe(catchError(() => of([] as Chapter[]))),
      weak: studentId != null
        ? this.performanceApi.weakTopics(studentId).pipe(catchError(() => of([] as WeakTopic[])))
        : of([] as WeakTopic[])
    }).subscribe(({ subjects, chapters, weak }) => {
      this.subjects.set(subjects);
      this.chapters.set(chapters);
      this.weakTopicsRaw.set(weak);
    });
  }

  continueLearning(): void {
    const c = this.recommendedChapter();
    if (c) this.router.navigate(['/learn/chapters', c.id]);
  }

  /**
   * Launch a focused drill on a weak topic. Routes to the quiz runner with
   * the recommended chapter pre-selected and the topicId passed as a hint
   * so the generator can narrow its scope when the backend supports it.
   * If no recommended chapter is known yet, falls back to the subjects list.
   */
  drillWeakTopic(w: WeakTopicView): void {
    const c = this.recommendedChapter();
    if (c) {
      this.router.navigate(['/learn/quiz'], {
        queryParams: { chapterId: c.id, topicId: w.topicId }
      });
    } else {
      this.router.navigate(['/learn/subjects']);
    }
  }
}
