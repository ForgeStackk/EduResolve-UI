import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NcertApiService, NCERTBook } from '../../../core/api/ncert-api.service';
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

  books         = signal<NCERTBook[]>([]);
  loading       = signal(false);
  booksError    = signal(false);
  bookmarkedIds = signal<Set<number>>(new Set());

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.catalog.load();
    this._loadBookmarks();

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this._resetAll();
      const subject = (params['subject'] ?? '').trim();
      this.selectedSubject = subject;
      if (subject) this._fetchBooks(subject);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubjectSelect(subject: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { classGrade: this.selectedClass, subject },
      queryParamsHandling: 'replace',
    });
  }

  goBack(): void { this.location.back(); }

  selectBook(book: NCERTBook): void {
    this.router.navigate(['/learn/pdf-viewer'], {
      queryParams: { bookId: book.id, title: book.title },
    });
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
    };
    return map[subject] ?? '#dc2626';
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

  private _resetAll(): void {
    this.books.set([]);
    this.booksError.set(false);
    this.loading.set(false);
  }

  private _fetchBooks(subject: string): void {
    this.loading.set(true);
    this.ncertApi.getBooks(this.selectedClass, subject).subscribe({
      next: books => {
        this.books.set(books);
        this.loading.set(false);
        if (books.length === 1) this.selectBook(books[0]);
      },
      error: () => {
        this.booksError.set(true);
        this.loading.set(false);
      },
    });
  }
}
