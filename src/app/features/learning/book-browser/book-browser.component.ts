import { Component, OnDestroy, OnInit, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NcertApiService, NCERTBook, NCERTChapter } from '../../../core/api/ncert-api.service';
import { BookmarkApiService } from '../../../core/api/bookmark-api.service';
import { AuthService, MOCK_STUDENT_PROFILE } from '../../../core/auth/auth.service';
import { ClassContextService } from '../../../core/class-context.service';
import { SubjectCatalogService } from '../../../core/subject-catalog.service';

@Component({
  selector: 'app-book-browser',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './book-browser.component.html',
  styleUrls: ['./book-browser.component.css']
})
export class BookBrowserComponent implements OnInit, OnDestroy {
  private ncertApi    = inject(NcertApiService);
  private bookmarkApi = inject(BookmarkApiService);
  private auth        = inject(AuthService);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);
  private location    = inject(Location);
  private classCtx    = inject(ClassContextService);
  readonly catalog    = inject(SubjectCatalogService);

  get subjects() { return this.catalog.subjects; }

  readonly selectedClass = this.classCtx.grade();
  selectedSubject = '';
  readonly studentId = this.auth.currentStudentId() ?? MOCK_STUDENT_PROFILE.id;

  allBooks        = signal<NCERTBook[]>([]);
  books           = signal<NCERTBook[]>([]);
  loading         = signal(false);
  booksError      = signal(false);
  bookmarkedIds   = signal<Set<number>>(new Set());

  selectedBook      = signal<NCERTBook | null>(null);
  chapters          = signal<NCERTChapter[]>([]);
  loadingChapters   = signal(false);
  // true when each chapter is its own separate PDF (folder-type books)
  chapterOwnPdf     = signal(false);

  private _booksLoaded = false;
  private destroy$ = new Subject<void>();

  constructor() {
    // Watch subjects signal; once loaded, fetch books for every subject in parallel
    effect(() => {
      const subjects = this.catalog.subjects();
      if (subjects.length > 0 && !this._booksLoaded) {
        this._booksLoaded = true;
        untracked(() => this._fetchAllBooks(subjects));
      }
    });
  }

  ngOnInit(): void {
    this.catalog.load();
    this._loadBookmarks();

    // Read subject filter from query param (client-side filter only)
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.selectedSubject = (params['subject'] ?? '').trim();
      // Reset selection before filtering so auto-select can re-trigger
      this.selectedBook.set(null);
      this.chapters.set([]);
      this.chapterOwnPdf.set(false);
      this._applyFilter();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubjectSelect(subject: string): void {
    this.selectedSubject = subject;
    this.selectedBook.set(null);
    this.chapters.set([]);
    this.chapterOwnPdf.set(false);
    this._applyFilter();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: subject ? { classGrade: this.selectedClass, subject } : {},
      queryParamsHandling: 'replace',
    });
  }

  goBack(): void { this.location.back(); }

  selectBook(book: NCERTBook): void {
    this.selectedBook.set(book);
    this.chapters.set([]);
    this.chapterOwnPdf.set(false);
    this.loadingChapters.set(true);

    this.ncertApi.getChapters(book.id).subscribe({
      next: chapters => {
        if (chapters.length > 0) {
          // Regular NCERT book — chapters share one PDF, use startPage
          this.chapters.set(chapters);
          this.loadingChapters.set(false);
        } else if (!book.pdfFilename) {
          // Folder-type book — each chapter is its own separate PDF
          this.ncertApi.getChapterPdfs(book.id).subscribe({
            next: chPdfs => {
              const asChapters: NCERTChapter[] = chPdfs.map((b, i) => ({
                id: b.id, bookId: book.id, title: b.title,
                chapterNumber: i + 1, orderIndex: i + 1, summary: '',
                startPage: 1, endPage: b.totalPages ?? 0,
              }));
              this.chapters.set(asChapters);
              this.chapterOwnPdf.set(true);
              this.loadingChapters.set(false);
            },
            error: () => this.loadingChapters.set(false),
          });
        } else {
          // Single-PDF book with no chapters — open directly
          this.loadingChapters.set(false);
          this.selectedBook.set(null);
          this.router.navigate(['/learn/pdf-viewer'], {
            queryParams: { bookId: book.id, title: book.title },
          });
        }
      },
      error: () => this.loadingChapters.set(false),
    });
  }

  openChapter(chapter: NCERTChapter): void {
    const book = this.selectedBook();
    if (!book) return;
    // Folder-type chapters each have their own PDF (use chapter.id as bookId)
    // Regular chapters share the parent book's PDF (use book.id + startPage)
    const bookId = this.chapterOwnPdf() ? chapter.id : book.id;
    this.router.navigate(['/learn/pdf-viewer'], {
      queryParams: { bookId, title: chapter.title, startPage: chapter.startPage },
    });
  }

  backToBooks(): void {
    this.selectedBook.set(null);
    this.chapters.set([]);
    this.chapterOwnPdf.set(false);
  }

  isBookmarked(bookId: number): boolean {
    return this.bookmarkedIds().has(bookId);
  }

  toggleBookmark(book: NCERTBook, event: Event): void {
    event.stopPropagation();
    if (this.isBookmarked(book.id)) {
      this.bookmarkApi.remove(this.studentId, 'CONTENT', book.id).subscribe(() => {
        this.bookmarkedIds.update(s => { const n = new Set(s); n.delete(book.id); return n; });
      });
    } else {
      this.bookmarkApi.add({
        studentId: this.studentId, targetType: 'CONTENT',
        targetId: book.id, label: book.title,
      }).subscribe(() => {
        this.bookmarkedIds.update(s => new Set([...s, book.id]));
      });
    }
  }

  getBookColor(subject: string): string {
    const map: Record<string, string> = {
      Mathematics: '#4CAF50', Physics: '#2196F3', Chemistry: '#FF9800',
      Biology: '#8BC34A', English: '#9C27B0', History: '#795548',
      Geography: '#009688', Science: '#F44336', Hindi: '#f59e0b',
      Sanskrit: '#8b5cf6',
    };
    return map[subject] ?? '#dc2626';
  }

  private _fetchAllBooks(subjects: string[]): void {
    this.loading.set(true);
    forkJoin(subjects.map(s => this.ncertApi.getBooks(this.selectedClass, s))).subscribe({
      next: booksPerSubject => {
        this.allBooks.set(booksPerSubject.flat());
        this._applyFilter();
        this.loading.set(false);
      },
      error: () => {
        this.booksError.set(true);
        this.loading.set(false);
      },
    });
  }

  private _applyFilter(): void {
    const all = this.allBooks();
    this.books.set(this.selectedSubject
      ? all.filter(b => b.subject === this.selectedSubject)
      : all);
    // Skip the book-card step when the subject has exactly one book
    this._autoSelectIfSingle();
  }

  private _autoSelectIfSingle(): void {
    if (!this.selectedSubject) return;        // Only when a subject is active
    if (this.selectedBook()) return;          // Already selected
    const filtered = this.books();
    if (filtered.length === 1) {
      this.selectBook(filtered[0]);
    }
  }

  private _loadBookmarks(): void {
    this.bookmarkApi.list(this.studentId).subscribe({
      next: bookmarks => {
        const ids = new Set(
          bookmarks.filter(b => b.targetType === 'CONTENT').map(b => b.targetId)
        );
        this.bookmarkedIds.set(ids);
      },
    });
  }
}
