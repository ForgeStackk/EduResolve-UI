import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Chapter, ChunkType, ContentChunk, LearningApiService, Topic } from '../../../core/api/learning-api.service';
import { PerformanceApiService, WeakTopic } from '../../../core/api/performance-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { NcertApiService, NCERTResource } from '../../../core/api/ncert-api.service';
import { InteractiveContentComponent } from '../interactive-content/interactive-content.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-chapter-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, InteractiveContentComponent],
  templateUrl: './chapter-detail.component.html',
  styleUrl: './chapter-detail.component.css'
})
export class ChapterDetailComponent implements OnInit {
  private api = inject(LearningApiService);
  private performanceApi = inject(PerformanceApiService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private ncertApi = inject(NcertApiService);
  protected lang = inject(LanguageService);

  protected tabs: { type: ChunkType; labelKey: string }[] = [
    { type: 'SUMMARY',      labelKey: 'Summary' },
    { type: 'EXPLANATION',  labelKey: 'Explanation' },
    { type: 'EXAMPLE',      labelKey: 'Examples' },
    { type: 'IMPORTANT_QA', labelKey: 'ImportantQa' },
    { type: 'DIAGRAM',      labelKey: 'Diagrams' },
  ];

  chapter = signal<Chapter | null>(null);
  topics  = signal<Topic[]>([]);
  loading = signal(true);

  /** topicId -> active tab. */
  active = signal<Record<number, ChunkType>>({});
  /** topicId -> currently loaded chunks. */
  chunksByTopic = signal<Record<number, ContentChunk[]>>({});
  /** NCERT resources for enhanced learning */
  ncertResources = signal<NCERTResource[]>([]);
  ncertLoading = signal(false);

  /** Performance records for the current student across all topics. */
  private weakTopics = signal<WeakTopic[]>([]);

  /**
   * Chapter mastery as a percentage (0 - 100). Averages the accuracy across
   * every weak-topic record that belongs to a topic in this chapter. If we
   * have no performance data yet, returns 0 so the meter honestly shows
   * "not started" instead of a misleading placeholder value.
   */
  progressPercent = computed<number>(() => {
    const topicIds = new Set(this.topics().map(t => t.id));
    if (topicIds.size === 0) return 0;
    const relevant = this.weakTopics().filter(w => topicIds.has(w.topicId));
    if (relevant.length === 0) return 0;
    const avg = relevant.reduce((s, w) => s + (w.accuracy ?? 0), 0) / relevant.length;
    return Math.max(0, Math.min(100, Math.round(avg)));
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getChapter(id).subscribe(c => {
      this.chapter.set(c);
      // Load NCERT resources for this chapter
      this.loadNcertResources(c);
    });
    this.api.listTopics(id).subscribe(rows => {
      this.topics.set(rows);
      const initial: Record<number, ChunkType> = {};
      rows.forEach(r => {
        initial[r.id] = 'SUMMARY';
        this.loadChunks(r.id, 'SUMMARY');
        // Pre-load explanation and examples to ensure content is available
        this.loadChunks(r.id, 'EXPLANATION');
        this.loadChunks(r.id, 'EXAMPLE');
      });
      this.active.set(initial);
      this.loading.set(false);
    });

    // Pull the student's performance snapshot to drive the real progress meter.
    const studentId = this.auth.currentStudentId();
    if (studentId) {
      this.performanceApi.weakTopics(studentId, 50).subscribe({
        next: (rows) => this.weakTopics.set(rows),
        error: (error) => console.error('Error loading weak topics:', error)
      });
    }
  }

  /**
   * Load NCERT resources for a chapter
   * Enriches the chapter with diagrams, 3D models, and interactive visualizations
   */
  private loadNcertResources(chapter: Chapter): void {
    // Extract grade from chapter or derive from context
    // In a real scenario, this would come from the chapter or student profile
    const grade = '11'; // Mock - would be dynamic
    const subject = 'Mathematics'; // Mock - would come from chapter metadata

    this.ncertLoading.set(true);
    this.ncertApi.getChapterResources(chapter.id.toString()).pipe(
      catchError(() => {
        console.log('NCERT resources not available, using default enrichment');
        return of([]);
      })
    ).subscribe(resources => {
      this.ncertResources.set(resources);
      this.ncertLoading.set(false);
    });
  }

  setActive(topicId: number, type: ChunkType) {
    this.active.update(prev => ({ ...prev, [topicId]: type }));
    this.loadChunks(topicId, type);
  }

  private loadChunks(topicId: number, type: ChunkType) {
    this.api.listContent(topicId, this.lang.current(), type).subscribe({
      next: (rows) => {
        this.chunksByTopic.update(prev => ({ ...prev, [topicId]: rows }));
      },
      error: (error) => {
        console.error(`Error loading chunks for topic ${topicId}, type ${type}:`, error);
        // Set empty array on error to prevent undefined issues
        this.chunksByTopic.update(prev => ({ ...prev, [topicId]: [] }));
      }
    });
  }

  back(): void {
    this.location.back();
  }
}
