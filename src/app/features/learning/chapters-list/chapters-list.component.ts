import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Chapter, LearningApiService, Subject } from '../../../core/api/learning-api.service';

@Component({
  selector: 'app-chapters-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './chapters-list.component.html',
  styleUrl: './chapters-list.component.css'
})
export class ChaptersListComponent implements OnInit {
  private api = inject(LearningApiService);
  private route = inject(ActivatedRoute);

  subject = signal<Subject | null>(null);
  chapters = signal<Chapter[]>([]);
  loading = signal(true);

  ngOnInit() {
    const subjectId = Number(this.route.snapshot.paramMap.get('subjectId'));
    this.api.listSubjects().subscribe(all => {
      this.subject.set(all.find(s => s.id === subjectId) ?? null);
    });
    this.api.listChapters(subjectId).subscribe({
      next: rows => { this.chapters.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
