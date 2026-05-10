import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { NcertLearningService, QuizRequest, QuizQuestion } from '../../../core/api/ncert-learning.service';

export interface QuizConfig {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  count: number;
  maxChapterId: number;
  classLevel: number;
  subject: string;
  timeLimit?: number; // in minutes
  randomize: boolean;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number; // in seconds
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
}

export interface UserAnswer {
  questionId: number;
  selectedOption: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  question: QuizQuestion;
}

@Component({
  selector: 'app-enhanced-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatStepperModule,
    MatProgressBarModule
  ],
  templateUrl: './enhanced-quiz.component.html',
  styleUrls: ['./enhanced-quiz.component.css']
})
export class EnhancedQuizComponent implements OnInit {
  private ncertService = inject(NcertLearningService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Quiz states
  currentStep = signal<'config' | 'quiz' | 'result'>('config');
  isLoading = signal<boolean>(false);

  // Configuration
  config = signal<QuizConfig>({
    difficulty: 'Medium',
    count: 10,
    maxChapterId: 5,
    classLevel: 9,
    subject: 'Mathematics',
    timeLimit: 30,
    randomize: true
  });

  // Quiz data
  questions = signal<QuizQuestion[]>([]);
  currentQuestionIndex = signal<number>(0);
  userAnswers = signal<UserAnswer[]>([]);
  selectedOption = '';

  // Timer
  timeRemaining = signal<number>(0);
  timeSpent = signal<number>(0);
  private timerInterval: any = null;

  // Results
  result = signal<QuizResult | null>(null);

  // Available options
  difficulties = ['Easy', 'Medium', 'Hard'];
  subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Science'];
  classes = [9, 10, 11, 12];

  ngOnInit(): void {
    this.initializeFromQueryParams();
  }

  initializeFromQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['bookId']) {
        this.config.update(config => ({
          ...config,
          maxChapterId: parseInt(params['bookId']) || 5
        }));
      }
      if (params['classLevel']) {
        this.config.update(config => ({
          ...config,
          classLevel: parseInt(params['classLevel']) || 9
        }));
      }
      if (params['subject']) {
        this.config.update(config => ({
          ...config,
          subject: params['subject'] || 'Mathematics'
        }));
      }
    });
  }

  startQuiz(): void {
    this.isLoading.set(true);
    this.currentStep.set('quiz');

    const request: QuizRequest = {
      difficulty: this.config().difficulty,
      count: this.config().count,
      maxChapterId: this.config().maxChapterId,
      classLevel: this.config().classLevel
    };

    this.ncertService.generateQuiz(request).subscribe({
      next: (questions) => {
        if (this.config().randomize) {
          questions = this.shuffleArray(questions);
        }
        this.questions.set(questions);
        this.currentQuestionIndex.set(0);
        this.userAnswers.set([]);
        this.selectedOption = '';
        this.startTimer();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error generating quiz:', error);
        this.snackBar.open('Failed to generate quiz. Please try again.', 'Close', { duration: 3000 });
        this.currentStep.set('config');
        this.isLoading.set(false);
      }
    });
  }

  startTimer(): void {
    const timeLimit = this.config().timeLimit || 30;
    this.timeRemaining.set(timeLimit * 60); // Convert to seconds
    this.timeSpent.set(0);

    this.timerInterval = setInterval(() => {
      this.timeRemaining.update(time => Math.max(0, time - 1));
      this.timeSpent.update(time => time + 1);

      if (this.timeRemaining() === 0) {
        this.submitQuiz();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  selectOption(option: string): void {
    this.selectedOption = option;
  }

  nextQuestion(): void {
    if (!this.selectedOption) {
      this.snackBar.open('Please select an answer', 'Close', { duration: 2000 });
      return;
    }

    const currentQuestion = this.questions()[this.currentQuestionIndex()];
    const isCorrect = this.selectedOption === currentQuestion.correct;

    const userAnswer: UserAnswer = {
      questionId: parseInt(currentQuestion.question || this.currentQuestionIndex().toString()),
      selectedOption: this.selectedOption!,
      isCorrect,
      timeSpent: 0, // Will be calculated per question
      question: currentQuestion
    };

    this.userAnswers.update(answers => [...answers, userAnswer]);
    this.selectedOption = '';

    if (this.currentQuestionIndex() < this.questions().length - 1) {
      this.currentQuestionIndex.update(index => index + 1);
    } else {
      this.submitQuiz();
    }
  }

  skipQuestion(): void {
    const currentQuestion = this.questions()[this.currentQuestionIndex()];
    
    const userAnswer: UserAnswer = {
      questionId: parseInt(currentQuestion.question || this.currentQuestionIndex().toString()),
      selectedOption: '',
      isCorrect: false,
      timeSpent: 0,
      question: currentQuestion
    };

    this.userAnswers.update(answers => [...answers, userAnswer]);
    this.selectedOption = '';

    if (this.currentQuestionIndex() < this.questions().length - 1) {
      this.currentQuestionIndex.update(index => index + 1);
    } else {
      this.submitQuiz();
    }
  }

  submitQuiz(): void {
    this.stopTimer();
    this.calculateResults();
    this.currentStep.set('result');
  }

  calculateResults(): void {
    const answers = this.userAnswers();
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const wrongAnswers = answers.filter(a => !a.isCorrect && a.selectedOption !== '').length;
    const skippedAnswers = answers.filter(a => a.selectedOption === '').length;
    const totalQuestions = this.questions().length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const result: QuizResult = {
      score: correctAnswers,
      totalQuestions,
      percentage,
      timeSpent: this.timeSpent(),
      correctAnswers,
      wrongAnswers,
      skippedAnswers
    };

    this.result.set(result);
  }

  restartQuiz(): void {
    this.currentStep.set('config');
    this.questions.set([]);
    this.userAnswers.set([]);
    this.selectedOption = '';
    this.result.set(null);
    this.stopTimer();
  }

  reviewAnswers(): void {
    // Navigate to review page or show modal
    this.showReviewDialog();
  }

  showReviewDialog(): void {
    // For now, we'll just show a snackbar
    this.snackBar.open('Review feature coming soon!', 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.stopTimer();
    this.router.navigate(['/learn/book-browser']);
  }

  // Helper methods
  getCurrentQuestion(): QuizQuestion | null {
    return this.questions()[this.currentQuestionIndex()] || null;
  }

  getProgress(): number {
    return ((this.currentQuestionIndex() + 1) / this.questions().length) * 100;
  }

  getQuestionNumber(): number {
    return this.currentQuestionIndex() + 1;
  }

  getTotalQuestions(): number {
    return this.questions().length;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getGradeColor(percentage: number): string {
    if (percentage >= 80) return '#4caf50'; // Green
    if (percentage >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  }

  getGradeMessage(percentage: number): string {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great job! Very good performance!';
    if (percentage >= 70) return 'Good work! Keep practicing!';
    if (percentage >= 60) return 'Fair performance. Room for improvement!';
    return 'Keep practicing! You can do better!';
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Keyboard shortcuts
  onKeyPress(event: KeyboardEvent): void {
    if (this.currentStep() === 'quiz') {
      const key = event.key.toLowerCase();
      if (key >= 'a' && key <= 'd') {
        const options = ['A', 'B', 'C', 'D'];
        this.selectOption(options[key.charCodeAt(0) - 97]);
      } else if (key === 'enter') {
        this.nextQuestion();
      } else if (key === 's') {
        this.skipQuestion();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // Helper method to get option color
  getOptionColor(index: number): 'primary' | 'accent' | 'warn' {
    const colors: ('primary' | 'accent' | 'warn')[] = ['primary', 'accent', 'warn', 'primary'];
    return colors[index % colors.length];
  }

  // Add Math object access
  get Math(): Math {
    return Math;
  }

  // Add String object access
  get String(): StringConstructor {
    return String;
  }
}
