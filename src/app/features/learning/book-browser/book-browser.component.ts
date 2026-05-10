import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NcertLearningService, NcertBook, NcertChapter } from '../../../core/api/ncert-learning.service';

@Component({
  selector: 'app-book-browser',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './book-browser.component.html',
  styleUrls: ['./book-browser.component.css']
})
export class BookBrowserComponent implements OnInit {
  private ncertService = inject(NcertLearningService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Available options
  classes = signal<string[]>([]);
  subjects = signal<string[]>([]);
  
  // Selected values
  selectedClass = '';
  selectedSubject = '';
  
  // Data
  books = signal<NcertBook[]>([]);
  chapters = signal<NcertChapter[]>([]);
  
  // UI state
  loading = signal<boolean>(false);
  selectedBook = signal<NcertBook | null>(null);

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.loading.set(true);
    this.ncertService.getClasses().subscribe({
      next: (classes) => {
        this.classes.set(classes);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading classes:', error);
        this.snackBar.open('Failed to load classes', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onClassChange(): void {
    if (!this.selectedClass) return;
    
    this.subjects.set([]);
    this.books.set([]);
    this.chapters.set([]);
    this.selectedBook.set(null);
    
    this.loading.set(true);
    this.ncertService.getSubjectsByClass(this.selectedClass).subscribe({
      next: (subjects) => {
        this.subjects.set(subjects);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.snackBar.open('Failed to load subjects', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onSubjectChange(): void {
    if (!this.selectedClass || !this.selectedSubject) return;
    
    this.books.set([]);
    this.chapters.set([]);
    this.selectedBook.set(null);
    
    this.loading.set(true);
    this.ncertService.getBooks(this.selectedClass, this.selectedSubject).subscribe({
      next: (books) => {
        this.books.set(books);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.snackBar.open('Failed to load books', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  selectBook(book: NcertBook): void {
    this.selectedBook.set(book);
    this.chapters.set([]);
    
    this.loading.set(true);
    this.ncertService.getChaptersByBook(book.id).subscribe({
      next: (chapters) => {
        this.chapters.set(chapters);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading chapters:', error);
        this.snackBar.open('Failed to load chapters', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  viewChapter(chapter: NcertChapter): void {
    this.router.navigate(['/learn/chapters', chapter.id], {
      queryParams: {
        bookId: this.selectedBook()?.id,
        bookTitle: this.selectedBook()?.title
      }
    });
  }

  viewPdf(): void {
    if (!this.selectedBook()) return;
    
    this.router.navigate(['/learn/pdf-viewer'], {
      queryParams: {
        bookId: this.selectedBook()?.id,
        title: this.selectedBook()?.title
      }
    });
  }

  startQuiz(): void {
    if (!this.selectedBook()) return;
    
    this.router.navigate(['/learn/quiz'], {
      queryParams: {
        bookId: this.selectedBook()?.id,
        bookTitle: this.selectedBook()?.title
      }
    });
  }

  askAI(): void {
    this.router.navigate(['/learn/ai-qa'], {
      queryParams: {
        classGrade: this.selectedClass,
        subject: this.selectedSubject
      }
    });
  }

  viewVisualization(): void {
    this.router.navigate(['/learn/visualization'], {
      queryParams: {
        classGrade: this.selectedClass,
        subject: this.selectedSubject
      }
    });
  }

  // Helper method to get class grade number from string
  getClassGradeNumber(classString: string): number {
    const match = classString.match(/\d+/);
    return match ? parseInt(match[0]) : 9;
  }

  // Helper method to get book color based on subject
  getBookColor(subject: string): string {
    const colors: { [key: string]: string } = {
      'Mathematics': '#4CAF50',
      'Physics': '#2196F3',
      'Chemistry': '#FF9800',
      'Biology': '#8BC34A',
      'English': '#9C27B0',
      'History': '#795548',
      'Geography': '#009688',
      'Science': '#F44336'
    };
    return colors[subject] || '#607D8B';
  }
}
