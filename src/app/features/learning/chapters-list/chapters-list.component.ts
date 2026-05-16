import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Chapter, LearningApiService, Subject } from '../../../core/api/learning-api.service';

@Component({
  selector: 'app-chapters-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './chapters-list.component.html',
  styleUrl: './chapters-list.component.css'
})
export class ChaptersListComponent implements OnInit {
  private api      = inject(LearningApiService);
  private route    = inject(ActivatedRoute);
  private router   = inject(Router);
  private location = inject(Location);

  subject  = signal<Subject | null>(null);
  chapters = signal<Chapter[]>([]);
  loading  = signal(true);

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

  back(): void {
    this.location.back();
  }

  /** Converts raw NCERT file IDs to human-readable chapter labels.
   *  'iehdd101' → last two digits = 01 → "Chapter 1" */
  sanitizeChapterName(name: string, idx: number): string {
    const trimmed = (name ?? '').trim();
    if (/^[a-z][a-z0-9]{3,15}$/i.test(trimmed)) {
      const lastTwo = trimmed.slice(-2);
      const num = parseInt(lastTwo, 10);
      return `Chapter ${isNaN(num) ? idx + 1 : num}`;
    }
    return name || `Chapter ${idx + 1}`;
  }

  /** Open the chapter's PDF directly from the local NCERT assets folder. */
  openChapterPdf(chapter: Chapter, idx: number): void {
    const s     = this.subject();
    const grade = (s?.grade ?? '9').replace(/[^0-9]/g, '');
    const pdfPath = `/assets/NCERT/${grade}/${s?.name ?? ''}/${chapter.name}.pdf`;
    const title   = this.sanitizeChapterName(chapter.name, idx);
    this.router.navigate(['/learn/pdf-viewer'], { queryParams: { pdfPath, title } });
  }

  handleChapterPdf(event: Event, chapter: Chapter, idx: number): void {
    event.stopPropagation();
    this.openChapterPdf(chapter, idx);
  }
}
