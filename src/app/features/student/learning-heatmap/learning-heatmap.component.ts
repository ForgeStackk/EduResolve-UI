import { Component, Input, OnChanges, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WeakTopic } from '../../../core/api/performance-api.service';

export interface SubjectStat {
  name: string;
  accuracy: number;
  sessions: number;  // simulated days active in last 7
  color: string;
  icon: string;
}

/** Skill Galaxy color scale: Dark Red → Orange → Radiant Green */
function heatColor(acc: number): string {
  if (acc >= 75) return '#22c55e';   // Radiant Green  — Mastered
  if (acc >= 45) return '#f97316';   // Orange         — In Progress
  return '#b91c1c';                  // Dark Red       — Urgent / Not Started
}

const COLOR_MAP: Record<string, string> = {
  physics: '#3b82f6', math: '#8b5cf6', mathematics: '#8b5cf6',
  chemistry: '#10b981', biology: '#10b981', science: '#10b981',
  english: '#ec4899', literature: '#ec4899',
  hindi: '#f59e0b', computer: '#f59e0b',
  history: '#f59e0b', geography: '#22d3ee',
};

const ICON_MAP: Record<string, string> = {
  physics: 'biotech', math: 'functions', mathematics: 'functions',
  chemistry: 'science', biology: 'eco', science: 'science',
  english: 'menu_book', literature: 'menu_book',
  hindi: 'translate', computer: 'memory',
  history: 'history_edu', geography: 'public',
};

@Component({
  selector: 'app-learning-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './learning-heatmap.component.html',
  styleUrl: './learning-heatmap.component.css'
})
export class LearningHeatmapComponent implements OnChanges {
  @Input() weakTopics:  WeakTopic[] = [];
  @Input() subjects:    string[] = [];
  @Input() grade = '9';
  /** Active reading-progress bookId — wires Launch Mission directly to the PDF. */
  @Input() activeBookId: number | null = null;

  private router = inject(Router);

  readonly dayLabels = ['6d', '5d', '4d', '3d', '2d', 'Yest', 'Today'];
  readonly roiPoints = 5;

  subjectStats = signal<SubjectStat[]>([]);

  prioritySubject = computed<SubjectStat | null>(() => {
    const s = this.subjectStats();
    return s.length ? [...s].sort((a, b) => a.accuracy - b.accuracy)[0] : null;
  });

  ngOnChanges(): void {
    const list = this.subjects.length ? this.subjects : this.extractSubjects();
    this.subjectStats.set(list.map(n => this.buildStat(n)));
  }

  private buildStat(name: string): SubjectStat {
    const lower = name.toLowerCase();
    const relevant = this.weakTopics.filter(w => (w as any).subject?.toLowerCase() === lower);
    const accuracy = relevant.length
      ? Math.round(relevant.reduce((s, w) => s + w.accuracy, 0) / relevant.length)
      : this.deterministicAccuracy(name);

    return {
      name,
      accuracy,
      sessions: this.deterministicSessions(name),
      color: COLOR_MAP[lower] ?? '#667eea',
      icon: ICON_MAP[lower] ?? 'menu_book',
    };
  }

  private extractSubjects(): string[] {
    const seen = new Set<string>();
    this.weakTopics.forEach(w => { const s = (w as any).subject; if (s) seen.add(s); });
    return seen.size
      ? Array.from(seen)
      : ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'English'];
  }

  private deterministicAccuracy(name: string): number {
    const h = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    return 42 + (h % 48);
  }

  private deterministicSessions(name: string): number {
    const h = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    return 2 + (h % 6);
  }

  cellColor(stat: SubjectStat, dayIdx: number): string {
    const hash = (stat.name.charCodeAt(0) + dayIdx * 7) % 10;
    if (hash >= stat.sessions) return 'rgba(255,255,255,0.04)';
    const opacity = 0.28 + (hash / 10) * 0.52;
    const hex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return stat.color + hex;
  }

  heatColorFor = heatColor;

  /** Returns the potential streak-point reward for studying this subject. */
  predictedPoints(stat: SubjectStat): number {
    if (stat.accuracy >= 75) return 0;   // already mastered
    if (stat.accuracy >= 45) return 3;   // mid-progress boost
    return 5;                            // urgent — maximum reward
  }

  /** Launch Mission: opens the active book's PDF directly if known;
   *  otherwise falls back to the book browser filtered by subject. */
  navigateToDrill(subject: string): void {
    if (this.activeBookId) {
      this.router.navigate(['/learn/pdf-viewer'], {
        queryParams: { bookId: this.activeBookId, title: subject }
      });
    } else {
      this.router.navigate(['/learn/books'], { queryParams: { classGrade: this.grade, subject } });
    }
  }

  /** Clicking a "Hot" (red) subject row jumps straight to the book browser
   *  so the PDF can be opened with one more click. */
  navigateUrgent(stat: SubjectStat): void {
    if (stat.accuracy < 45) {
      this.router.navigate(['/learn/books'], { queryParams: { classGrade: this.grade, subject: stat.name } });
    } else {
      this.navigateToDrill(stat.name);
    }
  }
}
