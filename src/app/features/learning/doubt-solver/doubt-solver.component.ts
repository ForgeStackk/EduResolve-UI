import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DoubtAnswer, DoubtSolverApiService } from '../../../core/api/doubt-solver-api.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { SubjectCatalogService } from '../../../core/subject-catalog.service';
import { ClassContextService } from '../../../core/class-context.service';
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';
import { GenerateNoteComponent } from '../../student/notes/generate-note/generate-note.component';

@Component({
  selector: 'app-doubt-solver',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MarkdownPipe, GenerateNoteComponent],
  templateUrl: './doubt-solver.component.html',
  styleUrl: './doubt-solver.component.css'
})
export class DoubtSolverComponent {
  private api      = inject(DoubtSolverApiService);
  private location = inject(Location);
  private lang     = inject(LanguageService);
  readonly catalog  = inject(SubjectCatalogService);
  readonly classCtx = inject(ClassContextService);

  query           = '';
  selectedSubject = signal('');
  loading         = signal(false);
  answer          = signal<DoubtAnswer | null>(null);
  feedback        = signal<'up' | 'down' | null>(null);
  showSaveNote    = signal(false);
  saveNotePrompt  = signal('');

  constructor() {
    this.catalog.load();
  }

  ask() {
    const q = this.query.trim();
    if (!q) return;
    this.loading.set(true);
    this.feedback.set(null);

    const subject = this.selectedSubject();
    const grade   = this.classCtx.grade();
    const ctxQuery = subject
      ? `[Class ${grade} · ${subject}] ${q}`
      : `[Class ${grade}] ${q}`;

    this.api.ask(ctxQuery, this.lang.current()).subscribe({
      next: ans => { this.answer.set(ans); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  rate(verdict: 'up' | 'down'): void {
    if (this.feedback() === verdict) return;
    this.feedback.set(verdict);
    const a = this.answer();
    if (a) {
      console.info('[doubt-solver] feedback', { answerId: a.id, verdict });
    }
  }

  saveAsNote(): void {
    const a = this.answer();
    if (!a) return;
    const text = `Q: ${this.query.trim()}\n\nA: ${a.answer}`.slice(0, 2000);
    this.saveNotePrompt.set(text);
    this.showSaveNote.set(true);
  }

  back(): void {
    this.location.back();
  }
}
