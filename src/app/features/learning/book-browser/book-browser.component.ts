import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { NcertApiService, NCERTBook } from '../../../core/api/ncert-api.service';
import { ClassContextService } from '../../../core/class-context.service';
import { SubjectCatalogService } from '../../../core/subject-catalog.service';

@Component({
  selector: 'app-book-browser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-browser.component.html',
  styleUrls: ['./book-browser.component.css']
})
export class BookBrowserComponent implements OnInit, OnDestroy {
  private ncertApi  = inject(NcertApiService);
  private router    = inject(Router);
  private route     = inject(ActivatedRoute);
  private location  = inject(Location);
  private classCtx  = inject(ClassContextService);
  readonly catalog  = inject(SubjectCatalogService);

  get subjects() { return this.catalog.subjects; }

  readonly selectedClass = this.classCtx.grade();
  selectedSubject = '';

  books      = signal<NCERTBook[]>([]);
  loading    = signal(false);
  booksError = signal(false);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.catalog.load();

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

  getBookColor(subject: string): string {
    const map: Record<string, string> = {
      Mathematics: '#4CAF50', Physics: '#2196F3', Chemistry: '#FF9800',
      Biology: '#8BC34A', English: '#9C27B0', History: '#795548',
      Geography: '#009688', Science: '#F44336', Hindi: '#f59e0b',
    };
    return map[subject] ?? '#dc2626';
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
