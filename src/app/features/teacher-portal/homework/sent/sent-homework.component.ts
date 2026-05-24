import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HomeworkService } from '../homework.service';
import { MessageSummary } from '../../shared/models/teacher-portal.models';

@Component({
  selector: 'app-sent-homework',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, TranslateModule],
  templateUrl: './sent-homework.component.html'
})
export class SentHomeworkComponent implements OnInit {
  private svc = inject(HomeworkService);

  items = signal<MessageSummary[]>([]);
  total = signal(0);
  page = signal(0);
  loading = signal(false);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getSent(undefined, undefined, this.page(), 20).subscribe({
      next: res => { this.items.set(res.content); this.total.set(res.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  prev(): void { if (this.page() > 0) { this.page.update(p => p - 1); this.load(); } }
  next(): void { this.page.update(p => p + 1); this.load(); }
}
