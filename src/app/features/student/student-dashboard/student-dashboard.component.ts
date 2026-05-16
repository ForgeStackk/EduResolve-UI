import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { StudentApiService, StudentProfile } from '../../../core/api/student-api.service';
import { LearningApiService, Chapter, NcertBook } from '../../../core/api/learning-api.service';
import { PerformanceApiService, WeakTopic } from '../../../core/api/performance-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { StreakEngineService } from '../streak-engine.service';
import { DailyMissionService, DailyMission } from '../daily-mission.service';
import { LiquidProgressRingComponent } from '../liquid-progress-ring/liquid-progress-ring.component';
import { AiDoubtCenterComponent } from '../ai-doubt-center/ai-doubt-center.component';
import { LearningHeatmapComponent } from '../learning-heatmap/learning-heatmap.component';
import { SubjectCatalogService } from '../../../core/subject-catalog.service';

interface ReadingProgress {
  id: number; studentId: number;
  subjectId?: number; chapterId?: number; bookId?: number;
  lastReadAt: string;
}

interface DailyPlanItem {
  chapterId: number;
  title: string; subject: string; minutes: number; done: boolean;
}

const SUBJECT_ACCENT: Record<string, string> = {
  physics: '#3b82f6', math: '#8b5cf6', mathematics: '#8b5cf6',
  chemistry: '#10b981', biology: '#10b981', english: '#ec4899',
  literature: '#ec4899', hindi: '#f59e0b', computer: '#f59e0b',
  history: '#f59e0b', geography: '#22d3ee', 'physical education': '#ef4444',
  science: '#10b981',
};

const SUBJECT_ICON: Record<string, string> = {
  physics: 'biotech', math: 'functions', mathematics: 'functions',
  chemistry: 'science', biology: 'eco', english: 'menu_book',
  literature: 'menu_book', hindi: 'translate', computer: 'memory',
  history: 'history_edu', geography: 'public', 'physical education': 'sports',
  science: 'science',
};

const RANK_TIERS = [
  { label: 'Beginner',   minXp: 0    },
  { label: 'Apprentice', minXp: 100  },
  { label: 'Scholar',    minXp: 300  },
  { label: 'Expert',     minXp: 700  },
  { label: 'Master',     minXp: 1500 },
];

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    LiquidProgressRingComponent,
    AiDoubtCenterComponent,
    LearningHeatmapComponent,
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrl:    './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  private studentApi      = inject(StudentApiService);
  private learningApi     = inject(LearningApiService);
  private performanceApi  = inject(PerformanceApiService);
  private auth            = inject(AuthService);
  private router          = inject(Router);
  private http            = inject(HttpClient);
  readonly streakEngine   = inject(StreakEngineService);
  readonly subjectCatalog = inject(SubjectCatalogService);
  readonly missions       = inject(DailyMissionService);

  // ---- Profile signals ----
  studentId      = signal<number | null>(null);
  studentName    = signal('');
  className      = signal('');
  initials       = signal('');
  grade          = signal('');
  streakDays     = signal(0);
  experiencePoints = signal(0);
  topPercentage  = signal(0);

  // ---- Content signals (accessible in template) ----
  subjectNames    = signal<string[]>([]);
  ncertBooks      = signal<NcertBook[]>([]);
  chapters        = signal<Chapter[]>([]);
  weakTopicsRaw   = signal<WeakTopic[]>([]);
  readingProgress = signal<ReadingProgress | null>(null);

  // ---- UI state ----
  private completed  = signal<Record<number, boolean>>({});
  private destroy$   = new Subject<void>();

  // ---- Computed ----
  firstName = computed(() => this.studentName().split(' ')[0] || '');

  hasProgress = computed(() => this.readingProgress()?.chapterId != null);

  recommendedChapter = computed<Chapter | null>(() => {
    const prog = this.readingProgress();
    if (prog?.chapterId) {
      const c = this.chapters().find(c => c.id === prog.chapterId);
      if (c) return c;
    }
    return null;
  });

  recommendedSubjectName = computed(() => this.subjectNames()[0] ?? '');

  recommendedAccuracy = computed<number | null>(() => {
    const wt = this.weakTopicsRaw()[0];
    return wt ? Math.round(wt.accuracy) : null;
  });

  recommendedProgressPercent = computed(() => {
    const acc = this.recommendedAccuracy();
    return acc == null ? 0 : Math.max(0, Math.min(100, acc));
  });

  dailyPlan = computed<DailyPlanItem[]>(() => {
    const done = this.completed();
    const prog = this.readingProgress();
    let list: Chapter[];
    let subject = this.subjectNames()[0] ?? 'Subject';

    if (prog?.subjectId) {
      list = this.chapters().filter(c => c.subjectId === prog.subjectId).slice(0, 3);
    } else {
      list = this.chapters().slice(0, 3);
    }

    return list.map(c => ({
      chapterId: c.id, title: c.name, subject,
      minutes: c.estimatedMinutes ?? 15,
      done: !!done[c.id],
    }));
  });

  weakTopics = computed(() =>
    this.weakTopicsRaw().slice(0, 4).map((w, i) => ({
      id: w.id, topicId: w.topicId,
      topicName: `Topic ${w.topicId}`, subject: 'General',
      accuracy: Math.round(w.accuracy),
    }))
  );

  focusChips = computed(() =>
    this.subjectNames().map((s, idx) => ({
      id: idx, name: s, icon: this.subjectIconFor(s), active: idx === 0,
    }))
  );

  private currentRankIndex = computed(() => {
    const xp = this.experiencePoints();
    let idx = 0;
    RANK_TIERS.forEach((t, i) => { if (xp >= t.minXp) idx = i; });
    return idx;
  });
  rankLabel    = computed(() => RANK_TIERS[this.currentRankIndex()].label);
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
    const cur = RANK_TIERS[i].minXp, next = RANK_TIERS[i + 1].minXp;
    const span = next - cur;
    return span <= 0 ? 100 : Math.max(0, Math.min(100, Math.round(((this.experiencePoints() - cur) / span) * 100)));
  });

  // ---- Streak Engine delegation ----
  readonly streakPoints   = computed(() => this.streakEngine.streakPoints());
  readonly streakRank     = computed(() => this.streakEngine.rank());
  readonly streakColor    = computed(() => this.streakEngine.rankColor());
  readonly streakProgress = computed(() => this.streakEngine.rankProgress());

  ngOnInit(): void {
    const user  = this.auth.currentUser();
    const id    = user?.studentId ?? this.auth.currentStudentId() ?? undefined;
    const grade = user?.grade ?? '9';
    this.loadStudentProfile(id);
    this.loadLearningData(grade, id);

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$),
    ).subscribe(e => {
      if ((e as NavigationEnd).urlAfterRedirects.includes('/student/dashboard')) {
        const justDone = this.missions.onReturn();
        justDone.forEach(missionId => {
          const m = this.missions.missions().find(x => x.id === missionId);
          if (m) {
            this.experiencePoints.update(x => x + m.xpReward);
            this.streakEngine.awardXp(Math.round(m.xpReward / 10));
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.missions.destroy();
  }

  private loadStudentProfile(studentId: number | undefined): void {
    if (!studentId) {
      const user = this.auth.currentUser();
      if (user?.id) {
        this.studentApi.getByUserIdString(user.id).subscribe({
          next: me => this.applyProfile(me),
          error: e => console.error('Profile load failed', e),
        });
      }
      return;
    }
    this.studentApi.getById(studentId).subscribe({
      next: me => this.applyProfile(me),
      error: e => console.error('Profile load failed', e),
    });
  }

  private applyProfile(me: StudentProfile): void {
    this.studentName.set(me.name ?? '');
    this.className.set(me.className ?? '');
    this.initials.set(me.initials ?? '');
    this.grade.set(me.grade ?? '');
    this.streakDays.set(me.streakDays ?? 0);
    this.experiencePoints.set(me.experiencePoints ?? 0);
    this.topPercentage.set(me.topPercentage ?? 0);
    // Seed the streak engine with the student's current XP (scaled to streak-point range)
    const scaled = Math.min(100, Math.round((me.experiencePoints ?? 0) / 15));
    this.streakEngine.seedPoints(scaled);
  }

  private loadLearningData(grade: string, studentId: number | undefined): void {
    forkJoin({
      subjects: this.subjectCatalog.getSubjects(grade),
      chapters: this.learningApi.listChapters().pipe(catchError(() => of([] as Chapter[]))),
      weak:     studentId != null
        ? this.performanceApi.weakTopics(studentId).pipe(catchError(() => of([] as WeakTopic[])))
        : of([] as WeakTopic[]),
      progress: studentId != null
        ? this.http.get<ReadingProgress>(`http://localhost:8080/api/reading-progress/student/${studentId}/latest`)
            .pipe(catchError(() => of(null as unknown as ReadingProgress)))
        : of(null as unknown as ReadingProgress),
    }).subscribe({
      next: ({ subjects, chapters, weak, progress }) => {
        this.subjectNames.set(subjects);
        this.chapters.set(chapters);
        this.weakTopicsRaw.set(weak);
        this.readingProgress.set(progress);
        // Generate daily missions once subjects are loaded
        this.missions.generate(grade, subjects);
      },
      error: e => console.error('Learning data failed', e),
    });
  }

  // ---- UI helpers ----
  subjectAccent(name: string | undefined): string {
    return SUBJECT_ACCENT[(name ?? '').toLowerCase()] ?? '#dc2626';
  }
  subjectIconFor(name: string | undefined): string {
    return SUBJECT_ICON[(name ?? '').toLowerCase()] ?? 'menu_book';
  }
  toggleDirective(chapterId: number): void {
    this.completed.update(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  }

  // ---- Navigation ----
  continueLearning(): void {
    const c = this.recommendedChapter();
    if (c) this.router.navigate(['/learn/chapters', c.id]);
  }
  openPdf(): void {
    const bookId = this.readingProgress()?.bookId;
    if (bookId) {
      this.router.navigate(['/learn/pdf-viewer'], { queryParams: { bookId } });
    } else {
      this.router.navigate(['/learn/books'], { queryParams: { classGrade: this.grade() || '9' } });
    }
  }
  drillWeakTopic(topicId: number, chapterId?: number): void {
    const c = this.recommendedChapter();
    if (c) {
      this.router.navigate(['/learn/quiz'], { queryParams: { chapterId: c.id, topicId } });
    } else {
      this.router.navigate(['/learn/subjects'], { queryParams: { subject: this.recommendedSubjectName() } });
    }
  }
  launchMission(m: DailyMission): void {
    this.missions.setActive(m.id);
    if (m.queryParams) {
      this.router.navigate(m.route, { queryParams: m.queryParams });
    } else {
      this.router.navigate(m.route);
    }
  }

  navigateToSubject(subjectName: string): void {
    const g = this.grade() || '9';
    this.router.navigate(['/learn/books'], { queryParams: { classGrade: g, subject: subjectName } });
  }

  /**
   * "Pre-read" simulation: returns the first chapter name for a subject,
   * falling back to subject-specific NCERT chapter 1 names when chapters
   * haven't loaded yet.
   */
  chapterNameHint(subject: string, index: number): string {
    const first = this.chapters().find(c => c.subjectId === index + 1);
    if (first) return first.name;
    const hints: Record<string, string> = {
      Physics:     'Physical World',
      Mathematics: 'Sets',
      Chemistry:   'Some Basic Concepts',
      Biology:     'The Living World',
      English:     'The Portrait of a Lady',
      Hindi:       'Namak ka Daroga',
      History:     'From the Beginning of Time',
      Geography:   'India — Location',
      Computer:    'Computer Systems',
      Science:     'Matter in Our Surroundings',
    };
    return hints[subject] ?? 'Introduction';
  }
}
