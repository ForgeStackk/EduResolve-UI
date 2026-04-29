import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizApiService, QuizQuestion } from '../../../core/api/quiz-api.service';

@Component({
  selector: 'app-test-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-generator.component.html',
  styleUrl: './test-generator.component.css'
})
export class TestGeneratorComponent implements OnInit {
  private quizApi = inject(QuizApiService);

  /** All questions fetched from the API. */
  private allQuestions = signal<QuizQuestion[]>([]);

  /** Distinct subjects derived from API data. */
  subjects = computed(() => Array.from(new Set(this.allQuestions().map(q => q.subject))));

  selectedSubject = signal('');
  selectedChapter = signal('');

  availableChapters = computed(() => {
    const sub = this.selectedSubject();
    if (!sub) return [];
    return Array.from(new Set(this.allQuestions().filter(q => q.subject === sub).map(q => q.chapter)));
  });

  filteredQuestions = computed(() => this.allQuestions().filter(
    q => q.subject === this.selectedSubject() && q.chapter === this.selectedChapter()
  ));

  ngOnInit(): void {
    this.quizApi.list().subscribe({
      next: rows => this.allQuestions.set(rows),
      error: err => console.error('Quiz questions load failed', err)
    });
  }

  onSubjectChange(sub: string): void {
    this.selectedSubject.set(sub);
    this.selectedChapter.set('');
  }
}