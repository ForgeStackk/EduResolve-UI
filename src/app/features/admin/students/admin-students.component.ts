import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AdminApiService, type StudentSummary, type PagedResponse } from '../../../core/api/admin-api.service';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-students.component.html',
})
export class AdminStudentsComponent implements OnInit, OnDestroy {
  private adminApi = inject(AdminApiService);
  private destroy$ = new Subject<void>();
  private searchTrigger$ = new Subject<void>();

  students   = signal<StudentSummary[]>([]);
  total      = signal(0);
  page       = signal(0);
  totalPages = signal(1);
  loading    = signal(true);
  search     = signal('');
  className  = signal('');

  readonly pageSize = 20;

  ngOnInit(): void {
    this.searchTrigger$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.page.set(0);
      this.load();
    });
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(): void { this.searchTrigger$.next(); }

  load(): void {
    this.loading.set(true);
    this.adminApi.getStudents(this.page(), this.pageSize, this.search(), this.className())
      .subscribe({
        next: (r: PagedResponse<StudentSummary>) => {
          this.students.set(r.data);
          this.total.set(r.total);
          this.totalPages.set(r.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  prevPage(): void { if (this.page() > 0) { this.page.update(p => p - 1); this.load(); } }
  nextPage(): void { if (this.page() < this.totalPages() - 1) { this.page.update(p => p + 1); this.load(); } }
}
