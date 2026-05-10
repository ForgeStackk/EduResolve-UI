import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PreviousYearQuestion, PYQDifficulty, PyqApiService } from '../../../core/api/pyq-api.service';

@Component({
  selector: 'app-pyq-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './pyq-list.component.html',
  styleUrl: './pyq-list.component.css'
})
export class PyqListComponent implements OnInit {
  private api = inject(PyqApiService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  chapterId = signal<number | null>(null);
  difficulty: PYQDifficulty | null = null;
  year: number | null = null;
  rows = signal<PreviousYearQuestion[]>([]);
  loading = signal(true);

  ngOnInit() {
    const cid = this.route.snapshot.queryParamMap.get('chapterId');
    if (cid) this.chapterId.set(Number(cid));
    this.reload();
  }

  reload() {
    if (!this.chapterId()) { this.rows.set([]); this.loading.set(false); return; }
    this.loading.set(true);
    this.api.list(this.chapterId()!, {
      difficulty: this.difficulty ?? undefined,
      year: this.year ?? undefined
    }).subscribe({
      next: rows => { this.rows.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  back(): void {
    this.location.back();
  }
}
