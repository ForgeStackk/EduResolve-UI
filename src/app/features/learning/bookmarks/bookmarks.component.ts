import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Bookmark, BookmarkApiService } from '../../../core/api/bookmark-api.service';
import { AuthService, MOCK_STUDENT_PROFILE } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.css'
})
export class BookmarksComponent implements OnInit {
  private api = inject(BookmarkApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  studentId = signal<number>(this.auth.currentStudentId() ?? MOCK_STUDENT_PROFILE.id);
  rows = signal<Bookmark[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.loading.set(true);
    this.api.list(this.studentId()).subscribe({
      next: rows => { this.rows.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  remove(b: Bookmark) {
    this.api.remove(b.studentId, b.targetType, b.targetId).subscribe(() => this.reload());
  }

  /**
   * Open a saved bookmark. Routes by target type - backend doesn't expose a
   * detail endpoint for every target (e.g. a specific quiz question), so we
   * deep-link to the nearest meaningful surface. When the backend adds
   * detail views, swap these targets accordingly.
   */
  open(b: Bookmark): void {
    switch (b.targetType) {
      case 'CONTENT':
        this.router.navigate(['/learn/pdf-viewer'], {
          queryParams: { bookId: b.targetId, title: b.label },
        });
        break;
      case 'QUIZ_QUESTION':
        this.router.navigate(['/learn/quiz']);
        break;
      case 'PYQ':
        this.router.navigate(['/learn/pyqs']);
        break;
      case 'DOUBT':
        this.router.navigate(['/learn/doubt']);
        break;
      default:
        this.router.navigate(['/learn/subjects']);
    }
  }

  iconFor(type: Bookmark['targetType']): string {
    switch (type) {
      case 'CONTENT':       return 'menu_book';
      case 'QUIZ_QUESTION': return 'quiz';
      case 'PYQ':           return 'history_edu';
      case 'DOUBT':         return 'psychology_alt';
      default:              return 'bookmark';
    }
  }
  colorFor(type: Bookmark['targetType']): string {
    switch (type) {
      case 'CONTENT':       return '#3b82f6';
      case 'QUIZ_QUESTION': return '#f59e0b';
      case 'PYQ':           return '#10b981';
      case 'DOUBT':         return '#8b5cf6';
      default:              return '#dc2626';
    }
  }
}
