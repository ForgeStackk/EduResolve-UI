import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { StudentApiService, StudentProfile } from '../../../core/api/student-api.service';
import { LearningApiService, Chapter, NcertBook } from '../../../core/api/learning-api.service';
import { PerformanceApiService, WeakTopic } from '../../../core/api/performance-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotesApiService, NoteStats } from '../../../core/api/notes-api.service';
import { StreakEngineService } from '../streak-engine.service';
import { AiDoubtCenterComponent } from '../ai-doubt-center/ai-doubt-center.component';
import { StudentInboxApiService, StudentInboxItem } from '../../../core/api/student-inbox-api.service';
import { MyDocumentsComponent } from '../../learning/my-documents/my-documents.component';
import { SubjectCatalogService } from '../../../core/subject-catalog.service';
import { StreakGardenComponent } from '../streak-garden/streak-garden.component';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';

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
    AiDoubtCenterComponent,
    MyDocumentsComponent,
    StreakGardenComponent,
    LeaderboardComponent,
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrl:    './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  private studentApi      = inject(StudentApiService);
  private learningApi     = inject(LearningApiService);
  private performanceApi  = inject(PerformanceApiService);
  private auth            = inject(AuthService);
  private router          = inject(Router);
  private http            = inject(HttpClient);
  private inboxApi        = inject(StudentInboxApiService);
  private notesApi        = inject(NotesApiService);
  readonly streakEngine   = inject(StreakEngineService);
  readonly subjectCatalog = inject(SubjectCatalogService);

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
  private completed     = signal<Record<number, boolean>>({});
  recentMessages        = signal<StudentInboxItem[]>([]);
  noteStats             = signal<NoteStats | null>(null);

  // ---- Computed ----
  firstName = computed(() => this.studentName().split(' ')[0] || '');

  classDisplayLabel = computed(() => {
    const cn = this.className();
    if (!cn) return this.grade() ? `Class ${this.grade()}` : '–';
    const g = cn.replace(/[^0-9]/g, '');
    const s = cn.replace(/[0-9]/g, '').toUpperCase();
    return s ? `Class ${g}-${s}` : `Class ${g}`;
  });

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
    // Extract numeric grade from className ("10C" → "10") immediately so leaderboard
    // and subject loading both get the correct value before async profile returns.
    const cn    = user?.className ?? user?.grade ?? '9';
    const grade = cn.replace(/[^0-9]/g, '') || '9';
    this.grade.set(grade);
    this.loadStudentProfile(id);
    this.loadLearningData(grade, id);
    this.inboxApi.getInbox(0, 5).subscribe({
      next: msgs => this.recentMessages.set(msgs),
      error: () => {}
    });
    this.notesApi.stats().subscribe({ next: s => this.noteStats.set(s), error: () => {} });
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
    this.studentId.set(me.id);
    this.studentName.set(me.name ?? '');
    this.className.set(me.className ?? '');
    this.initials.set(me.initials ?? '');
    // grade field in StudentProfile is often null; derive from className as fallback
    const derivedGrade = me.grade || (me.className ? me.className.replace(/[^0-9]/g, '') : '') || '9';
    this.grade.set(derivedGrade);
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
        this.chapters.set([...chapters].sort((a, b) => (a.orderIndex ?? a.id) - (b.orderIndex ?? b.id)));
        this.weakTopicsRaw.set(weak);
        this.readingProgress.set(progress);
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
  navigateToSubject(subjectName: string): void {
    const g = this.grade() || '9';
    this.router.navigate(['/learn/books'], { queryParams: { classGrade: g, subject: subjectName } });
  }

  msgIcon(category: string): string {
    if (category === 'HOMEWORK') return 'assignment';
    if (category === 'ABSENCE_NOTIFICATION') return 'warning';
    return 'forum';
  }

  formatMsgDate(iso: string): string {
    const d = new Date(iso);
    const diffH = Math.floor((Date.now() - d.getTime()) / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  /**
   * "Pre-read" simulation: returns the first chapter name for a subject,
   * falling back to subject-specific NCERT chapter 1 names when chapters
   * haven't loaded yet.
   */
  chapterNameHint(subject: string, index: number): string {
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
    const first = this.chapters().find(c => c.subjectId === index + 1);
    if (first) {
      const name = (first.name ?? '').trim();
      // Skip raw NCERT file codes like 'jehp109', 'iehdd101'
      if (name && !/^[a-zA-Z][a-zA-Z0-9]{3,15}$/.test(name)) return name;
    }
    return hints[subject] ?? 'Introduction';
  }
}
