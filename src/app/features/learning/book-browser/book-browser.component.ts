import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
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

  books           = signal<NCERTBook[]>([]);
  loading         = signal(false);
  booksError      = signal(false);
  bookmarkedIds   = signal<Set<number>>(new Set());

  selectedBook      = signal<NCERTBook | null>(null);
  chapters          = signal<NCERTChapter[]>([]);
  loadingChapters   = signal(false);
  chapterOwnPdf     = signal(false);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.catalog.load();
    this._loadBookmarks();

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const subject = (params['subject'] ?? '').trim();
      this.selectedSubject = subject;
      this.selectedBook.set(null);
      this.chapters.set([]);
      this.chapterOwnPdf.set(false);
      this._fetchBooksFor(subject);
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: subject ? { classGrade: this.selectedClass, subject } : {},
      queryParamsHandling: 'replace',
    });
    // route.queryParams subscription fires automatically and calls _fetchBooksFor
  }

  goBack(): void { this.location.back(); }

  selectBook(book: NCERTBook): void {
    this.selectedBook.set(book);
    this.chapters.set([]);
    this.chapterOwnPdf.set(false);
    this.loadingChapters.set(true);

    // Decide path by book type, not by chapters count.
    // Folder-type books (pdfFilename blank) each have their chapters as separate PDF files.
    // Checking pdfFilename here prevents placeholder DB chapters from misdirecting the flow.
    const isFolderType = !book.pdfFilename;

    if (isFolderType) {
      // Each chapter is its own PDF — fetch the chapter-PDF records for this book folder.
      this.ncertApi.getChapterPdfs(book.id).subscribe({
        next: chPdfs => {
          const asChapters: NCERTChapter[] = chPdfs.map((b, i) => ({
            id: b.id, bookId: book.id, title: b.title,
            chapterNumber: i + 1, orderIndex: i + 1, summary: '',
            startPage: 1, endPage: b.totalPages ?? 0,
          }));
          this.chapters.set(this._sortChapters(asChapters));
          this.chapterOwnPdf.set(true);
          this.loadingChapters.set(false);
        },
        error: () => this.loadingChapters.set(false),
      });
    } else {
      // Single-PDF book — chapters share one PDF file via startPage offsets.
      this.ncertApi.getChapters(book.id).subscribe({
        next: chapters => {
          if (chapters.length > 0) {
            this.chapters.set(this._sortChapters(chapters));
            this.loadingChapters.set(false);
          } else {
            // No chapters extracted yet — open the whole PDF directly.
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
  }

  openChapter(chapter: NCERTChapter): void {
    const book = this.selectedBook();
    if (!book) return;
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

  private _fetchBooksFor(subject: string): void {
    this.loading.set(true);
    this.booksError.set(false);
    this.books.set([]);

    if (!subject) {
      // No subject filter — nothing to show; catalog dropdown will guide the user
      this.loading.set(false);
      return;
    }

    this.ncertApi.getBooks(this.selectedClass, subject).subscribe({
      next: books => {
        this.books.set(books);
        this.loading.set(false);
        this._autoSelectIfSingle();
      },
      error: () => {
        this.booksError.set(true);
        this.loading.set(false);
      },
    });
  }

  private _autoSelectIfSingle(): void {
    if (!this.selectedSubject) return;
    if (this.selectedBook()) return;
    const filtered = this.books();
    if (filtered.length === 1) {
      this.selectBook(filtered[0]);
    }
  }

  /** Sort chapters numerically by chapterNumber, falling back to orderIndex. */
  private _sortChapters(chapters: NCERTChapter[]): NCERTChapter[] {
    return [...chapters].sort(
      (a, b) => (a.chapterNumber ?? a.orderIndex ?? 0) - (b.chapterNumber ?? b.orderIndex ?? 0)
    );
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
