import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NcertApiService, NCERTBook, NCERTChapter } from '../../../core/api/ncert-api.service';
import { ClassContextService } from '../../../core/class-context.service';
import { SubjectCatalogService } from '../../../core/subject-catalog.service';

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
  private router   = inject(Router);
  private classCtx = inject(ClassContextService);
  readonly catalog  = inject(SubjectCatalogService);

  /** Proxy to catalog so the template can call subjects() */
  get subjects() { return this.catalog.subjects; }

  selectedGrade   = signal<string>('');
  selectedSubject = signal<string>('');
  ncertBooks      = signal<NCERTBook[]>([]);
  ncertChapters   = signal<NCERTChapter[]>([]);
  loading         = signal(false);
  hasSearched     = signal(false);

  ngOnInit(): void {
    const grade = this.classCtx.grade();
    this.selectedGrade.set(grade);
    
    // Fetch subjects via catalog (cached, correct endpoint)
    this.catalog.getSubjects(grade).subscribe(list => {
      if (list.length > 0 && !this.selectedSubject()) {
        this.selectedSubject.set(list[0]);
      }
    });
  }

  /** No-op kept so template references don't break. */
  loadSubjectsForClass(_grade: string): void { /* delegated to SubjectCatalogService */ }

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

  /** Open the chapter's PDF at its start page. */
  selectChapter(chapter: NCERTChapter): void {
    this.router.navigate(['/learn/pdf-viewer'], {
      queryParams: {
        bookId:    chapter.bookId,
        startPage: chapter.startPage ?? 1,
        title:     this.sanitizeChapterId(chapter.title, chapter.chapterNumber)
      }
    });
  }

  /** Construct a local asset path for a chapter and open the PDF viewer. */
  handleChapterClick(chapterId: string, chapterNumber: number): void {
    const grade   = this.selectedGrade();
    const subject = this.selectedSubject();
    const pdfPath = `/assets/NCERT/${grade}/${subject}/${chapterId}.pdf`;
    this.router.navigate(['/learn/pdf-viewer'], {
      queryParams: { pdfPath, title: `Chapter ${chapterNumber}` }
    });
  }

  /** Converts raw NCERT file IDs to human-readable labels.
   *  'iehdd101' → last two digits = 01 → "Chapter 1" */
  sanitizeChapterId(title: string, chapterNumber: number): string {
    const trimmed = (title ?? '').trim();
    if (/^[a-z][a-z0-9]{3,15}$/i.test(trimmed)) {
      const lastTwo = trimmed.slice(-2);
      const num = parseInt(lastTwo, 10);
      return `Chapter ${isNaN(num) ? chapterNumber : num}`;
    }
    return title || `Chapter ${chapterNumber}`;
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
