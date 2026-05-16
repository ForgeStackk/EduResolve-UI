import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { LearningApiService, CurriculumSubject } from '../../../core/api/learning-api.service';

const SUBJECT_THEME: Record<string, { color: string; icon: string; tag: string }> = {
  physics:           { color: '#3b82f6', icon: 'biotech',     tag: 'Kinematics & Dynamics' },
  math:              { color: '#8b5cf6', icon: 'functions',   tag: 'Algebra & Geometry' },
  mathematics:       { color: '#8b5cf6', icon: 'functions',   tag: 'Algebra & Geometry' },
  chemistry:         { color: '#10b981', icon: 'science',     tag: 'Molecular Structure' },
  biology:           { color: '#10b981', icon: 'eco',         tag: 'Life Sciences' },
  english:           { color: '#ec4899', icon: 'menu_book',   tag: 'Language & Literature' },
  literature:        { color: '#ec4899', icon: 'menu_book',   tag: 'Language & Literature' },
  hindi:             { color: '#f59e0b', icon: 'translate',   tag: 'Hindi Literature' },
  sanskrit:          { color: '#3b82f6', icon: 'history_edu', tag: 'Sanskrit' },
  computer:          { color: '#f59e0b', icon: 'memory',      tag: 'Algorithms & Logic' },
  history:           { color: '#f59e0b', icon: 'history_edu', tag: 'Civilizations & Wars' },
  geography:         { color: '#22d3ee', icon: 'public',      tag: 'Earth Systems' },
  'physical education': { color: '#ef4444', icon: 'sports',   tag: 'Physical Education' },
  'social science':  { color: '#22d3ee', icon: 'public',      tag: 'Civics & History' },
  science:           { color: '#10b981', icon: 'science',     tag: 'General Science' }
};

interface SubjectCard {
  name: string;
  tag: string;
  color: string;
  icon: string;
  chapterCount: number;
}

@Component({
  selector: 'app-subjects-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './subjects-list.component.html',
  styleUrl: './subjects-list.component.css'
})
export class SubjectsListComponent implements OnInit {
  private api      = inject(LearningApiService);
  private auth     = inject(AuthService);
  private router   = inject(Router);
  private location = inject(Location);

  curriculum = signal<CurriculumSubject[]>([]);
  loading    = signal(true);
  classGrade = signal('9');

  cards = computed<SubjectCard[]>(() =>
    this.curriculum().map(s => {
      const theme = this.themeFor(s.name);
      return {
        name: s.name,
        tag:  theme.tag,
        color: s.colorHex || theme.color,
        icon:  s.icon     || theme.icon,
        chapterCount: s.chapters?.length || 0
      };
    })
  );

  ngOnInit() {
    const user = this.auth.currentUser();
    // Extract numeric grade: "10A" -> "10", "9B" -> "9"
    const grade = ((user?.className ?? '')).replace(/[^0-9]/g, '') || '9';
    this.classGrade.set(grade);

    this.api.getCurriculum(grade).subscribe({
      next: curriculum => {
        this.curriculum.set(curriculum);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goBack(): void { this.location.back(); }

  openSubject(subjectName: string): void {
    this.router.navigate(['/learn/books'], {
      queryParams: { subject: subjectName, classGrade: this.classGrade() }
    });
  }

  private themeFor(name: string) {
    const k = (name ?? '').toLowerCase();
    for (const key of Object.keys(SUBJECT_THEME)) {
      if (k.includes(key)) return SUBJECT_THEME[key];
    }
    return { color: '#dc2626', icon: 'school', tag: 'Mastery Module' };
  }
}
