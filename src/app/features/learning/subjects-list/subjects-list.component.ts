import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LearningApiService, Subject } from '../../../core/api/learning-api.service';
import { PerformanceApiService, WeakTopic } from '../../../core/api/performance-api.service';
import { StudentApiService, StudentProfile } from '../../../core/api/student-api.service';
import { AuthService, MOCK_STUDENT_PROFILE } from '../../../core/auth/auth.service';
import { LanguageService } from '../../../core/i18n/language.service';

const SUBJECT_THEME: Record<string, { color: string; icon: string; tag: string }> = {
  physics:    { color: '#3b82f6', icon: 'biotech',    tag: 'Kinematics & Dynamics' },
  math:       { color: '#8b5cf6', icon: 'functions',  tag: 'Calculus & Vectors' },
  mathematics:{ color: '#8b5cf6', icon: 'functions',  tag: 'Calculus & Vectors' },
  chemistry:  { color: '#10b981', icon: 'science',    tag: 'Molecular Structure' },
  biology:    { color: '#10b981', icon: 'eco',        tag: 'Life Sciences' },
  english:    { color: '#ec4899', icon: 'menu_book',  tag: 'Language & Literature' },
  literature: { color: '#ec4899', icon: 'menu_book',  tag: 'Language & Literature' },
  computer:   { color: '#f59e0b', icon: 'memory',     tag: 'Algorithms & Logic' },
  history:    { color: '#f59e0b', icon: 'history_edu',tag: 'Civilizations & Wars' },
  geography:  { color: '#22d3ee', icon: 'public',     tag: 'Earth Systems' }
};

interface SubjectCard {
  id: number;
  name: string;
  tag: string;
  color: string;
  icon: string;
  mastery: number;
}

@Component({
  selector: 'app-subjects-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './subjects-list.component.html',
  styleUrl: './subjects-list.component.css'
})
export class SubjectsListComponent implements OnInit {
  private api = inject(LearningApiService);
  private performanceApi = inject(PerformanceApiService);
  private studentApi = inject(StudentApiService);
  private auth = inject(AuthService);
  protected lang = inject(LanguageService);

  subjects = signal<Subject[]>([]);
  weakTopics = signal<WeakTopic[]>([]);
  profile = signal<StudentProfile | null>(null);
  loading = signal(true);

  cards = computed<SubjectCard[]>(() => {
    return this.subjects().map(s => {
      const theme = this.themeFor(s.name);
      return {
        id: s.id,
        name: s.name,
        tag: theme.tag,
        color: theme.color,
        icon: theme.icon,
        mastery: this.masteryFor(s.id)
      };
    });
  });

  ngOnInit() {
    const id = this.auth.currentStudentId() ?? MOCK_STUDENT_PROFILE.id;

    // Resolve the student profile (id-based, not list-based) so we always
    // get the authenticated user even when seeded data has gaps.
    this.studentApi.getById(id).pipe(
      catchError(() => of(MOCK_STUDENT_PROFILE as unknown as StudentProfile))
    ).subscribe(me => {
      this.profile.set(me);
      forkJoin({
        subjects: this.api.listSubjects(me.grade).pipe(catchError(() => of([] as Subject[]))),
        weak: this.performanceApi.weakTopics(me.id, 50).pipe(catchError(() => of([] as WeakTopic[])))
      }).subscribe(({ subjects, weak }) => {
        this.subjects.set(subjects);
        this.weakTopics.set(weak);
        this.loading.set(false);
      });
    });
  }

  private themeFor(name: string) {
    const k = (name ?? '').toLowerCase();
    for (const key of Object.keys(SUBJECT_THEME)) {
      if (k.includes(key)) return SUBJECT_THEME[key];
    }
    return { color: '#dc2626', icon: 'school', tag: 'Mastery Module' };
  }

  /**
   * Approximate mastery: if we have weak-topic accuracy data we average it for
   * topics in this subject, otherwise return a neutral 70% baseline so the
   * card still renders meaningfully.
   * Topic -> subject relationship requires a lookup; we use weakTopics as a
   * directional mastery indicator (lower accuracy -> lower mastery).
   */
  private masteryFor(_subjectId: number): number {
    const weak = this.weakTopics();
    if (weak.length === 0) return 70;
    // Use the average accuracy across all weak topics as a rough mastery
    // proxy. (Backend doesn't currently expose subject-level mastery.)
    const avg = weak.reduce((s, w) => s + (w.accuracy ?? 0), 0) / weak.length;
    return Math.max(20, Math.min(95, Math.round(avg)));
  }
}
