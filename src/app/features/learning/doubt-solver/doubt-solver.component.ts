import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DoubtAnswer, DoubtSolverApiService } from '../../../core/api/doubt-solver-api.service';
import { LanguageService } from '../../../core/i18n/language.service';

/**
 * Cost-aware doubt solver UI.
 *  - DB hits return instantly (cache | db)
 *  - AI fallback only when nothing matches
 */
@Component({
  selector: 'app-doubt-solver',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './doubt-solver.component.html',
  styleUrl: './doubt-solver.component.css'
})
export class DoubtSolverComponent {
  private api = inject(DoubtSolverApiService);
  private lang = inject(LanguageService);

  query = '';
  loading = signal(false);
  answer = signal<DoubtAnswer | null>(null);

  ask() {
    const q = this.query.trim();
    if (!q) return;
    this.loading.set(true);
    this.api.ask(q, this.lang.current()).subscribe({
      next: ans => { this.answer.set(ans); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
