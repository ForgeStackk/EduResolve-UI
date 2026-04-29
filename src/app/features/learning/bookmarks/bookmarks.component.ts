import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Bookmark, BookmarkApiService } from '../../../core/api/bookmark-api.service';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.css'
})
export class BookmarksComponent implements OnInit {
  private api = inject(BookmarkApiService);

  /** TODO replace with auth-derived studentId. */
  studentId = 1;

  rows = signal<Bookmark[]>([]);
  loading = signal(true);

  ngOnInit() { this.reload(); }

  reload() {
    this.loading.set(true);
    this.api.list(this.studentId).subscribe({
      next: rows => { this.rows.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  remove(b: Bookmark) {
    this.api.remove(b.studentId, b.targetType, b.targetId).subscribe(() => this.reload());
  }
}
