import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NcertApiService, NCERTBook, NCERTChapter } from '../../../core/api/ncert-api.service';

/**
 * NCERT Chapter Browser Component
 * Allows students to browse and select NCERT chapters by class and subject
 * Integrates NCERT curriculum structure directly into EduResolve
 */
@Component({
  selector: 'app-ncert-browser',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './ncert-browser.component.html',
  styleUrl: './ncert-browser.component.css'
})
export class NcertBrowserComponent implements OnInit {
  private ncertApi = inject(NcertApiService);
  private router = inject(Router);

  // NCERT filtering options - loaded from API
  grades = signal<string[]>([]);
  subjects = signal<string[]>([]);

  selectedGrade = signal<string>('');
  selectedSubject = signal<string>('');
  ncertBooks = signal<NCERTBook[]>([]);
  ncertChapters = signal<NCERTChapter[]>([]);
  loading = signal(false);
  hasSearched = signal(false);

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.ncertApi.getClasses().subscribe({
      next: (classes: string[]) => {
        this.grades.set(classes);
        if (classes.length > 0) {
          this.selectedGrade.set(classes[0]);
          this.loadSubjectsForClass(classes[0]);
        }
      },
      error: (err: any) => {
        console.error('Failed to load classes', err);
        // Fallback to default classes
        this.grades.set(['9', '10', '11', '12']);
        this.selectedGrade.set('9');
        this.loadSubjectsForClass('9');
      }
    });
  }

  loadSubjectsForClass(classGrade: string): void {
    this.ncertApi.getSubjectsByClass(classGrade).subscribe({
      next: (subjects: string[]) => {
        this.subjects.set(subjects);
        if (subjects.length > 0) {
          this.selectedSubject.set(subjects[0]);
        } else {
          this.selectedSubject.set('');
        }
        // Reset books and chapters when class/subject changes
        this.ncertBooks.set([]);
        this.ncertChapters.set([]);
        this.hasSearched.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load subjects', err);
        this.subjects.set([]);
        this.selectedSubject.set('');
      }
    });
  }

  loadNcertChapters(): void {
    this.loading.set(true);
    this.hasSearched.set(true);
    this.ncertApi.getBooks(this.selectedGrade(), this.selectedSubject()).subscribe({
      next: (books: NCERTBook[]) => {
        this.ncertBooks.set(books);
        // Clear previous chapters when new search is made
        this.ncertChapters.set([]);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load NCERT books', err);
        this.loading.set(false);
      }
    });
  }

  loadChaptersForBook(bookId: number): void {
    this.ncertApi.getChapters(bookId).subscribe({
      next: (chapters: NCERTChapter[]) => {
        this.ncertChapters.set(chapters);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load NCERT chapters', err);
        this.loading.set(false);
      }
    });
  }

  onGradeChange(grade: string): void {
    this.selectedGrade.set(grade);
    this.loadSubjectsForClass(grade);
  }

  onSubjectChange(subject: string): void {
    this.selectedSubject.set(subject);
    // Reset search state when subject changes
    this.ncertBooks.set([]);
    this.ncertChapters.set([]);
    this.hasSearched.set(false);
  }

  onSearch(): void {
    if (this.selectedGrade() && this.selectedSubject()) {
      this.loadNcertChapters();
    }
  }

  // Getter/setter for ngModel compatibility with signals
  get selectedGradeValue(): string {
    return this.selectedGrade();
  }

  set selectedGradeValue(value: string) {
    if (value !== this.selectedGrade()) {
      this.selectedGrade.set(value);
      this.loadSubjectsForClass(value);
    }
  }

  get selectedSubjectValue(): string {
    return this.selectedSubject();
  }

  set selectedSubjectValue(value: string) {
    if (value !== this.selectedSubject()) {
      this.selectedSubject.set(value);
      // Reset search state
      this.ncertBooks.set([]);
      this.ncertChapters.set([]);
      this.hasSearched.set(false);
    }
  }

  /**
   * Navigate to chapter detail view with NCERT resources pre-loaded
   */
  selectChapter(chapter: NCERTChapter): void {
    this.router.navigate(['/learn/chapters', chapter.id]);
  }

  /**
   * View book content - navigates to PDF viewer or chapter list
   */
  viewBookContent(book: NCERTBook): void {
    // Navigate to PDF viewer with the book ID
    this.router.navigate(['/learn/pdf-viewer'], { 
      queryParams: { 
        bookId: book.id,
        pdfPath: book.githubPath,
        title: book.title 
      } 
    });
  }
}
