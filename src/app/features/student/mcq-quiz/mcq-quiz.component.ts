import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

@Component({
  selector: 'app-mcq-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mcq-quiz.component.html',
  styleUrl: './mcq-quiz.component.css'
})
export class McqQuizComponent {
  questions = input.required<Question[]>();
  currentIndex = signal(0);
  selectedOptionId = signal<string | null>(null);
  showFeedback = signal(false);

  currentQuestion = computed(() => this.questions()[this.currentIndex()]);
  isCorrect = computed(() => this.selectedOptionId() === this.currentQuestion()?.correctOptionId);

  selectOption(id: string) {
    if (this.showFeedback()) return;
    this.selectedOptionId.set(id);
  }

  submit() {
    if (!this.selectedOptionId()) return;
    this.showFeedback.set(true);
  }

  next() {
    if (this.currentIndex() < this.questions().length - 1) {
      this.currentIndex.update(i => i + 1);
      this.selectedOptionId.set(null);
      this.showFeedback.set(false);
    }
  }

  getOptionClass(optionId: string): string {
    const q = this.currentQuestion();
    
    // Default / Hover states when answering
    if (!this.showFeedback()) {
      return this.selectedOptionId() === optionId
        ? 'border-brand-orange bg-orange-50 text-brand-orange shadow-sm'
        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white hover:bg-gray-50';
    }

    // Feedback states once submitted
    if (optionId === q?.correctOptionId) {
      return 'border-green-500 bg-green-50 text-green-700';
    }
    if (this.selectedOptionId() === optionId) {
      return 'border-red-500 bg-red-50 text-red-700';
    }
    
    // Unselected wrong answers fade back
    return 'border-gray-200 text-gray-400 bg-gray-50 opacity-60';
  }
}