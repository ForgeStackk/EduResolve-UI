import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Chapter, ChunkType, ContentChunk, LearningApiService, Topic } from '../../../core/api/learning-api.service';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-chapter-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './chapter-detail.component.html',
  styleUrl: './chapter-detail.component.css'
})
export class ChapterDetailComponent implements OnInit {
  private api = inject(LearningApiService);
  private route = inject(ActivatedRoute);
  protected lang = inject(LanguageService);

  protected tabs: { type: ChunkType; labelKey: string }[] = [
    { type: 'SUMMARY',      labelKey: 'chapters.summary' },
    { type: 'EXPLANATION',  labelKey: 'chapters.explanation' },
    { type: 'EXAMPLE',      labelKey: 'chapters.examples' },
    { type: 'IMPORTANT_QA', labelKey: 'chapters.importantQa' },
  ];

  chapter = signal<Chapter | null>(null);
  topics  = signal<Topic[]>([]);
  loading = signal(true);

  /** topicId -> active tab. */
  active = signal<Record<number, ChunkType>>({});
  /** topicId -> currently loaded chunks. */
  chunksByTopic = signal<Record<number, ContentChunk[]>>({});

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getChapter(id).subscribe(c => this.chapter.set(c));
    this.api.listTopics(id).subscribe(rows => {
      this.topics.set(rows);
      const initial: Record<number, ChunkType> = {};
      rows.forEach(r => { initial[r.id] = 'SUMMARY'; this.loadChunks(r.id, 'SUMMARY'); });
      this.active.set(initial);
      this.loading.set(false);
    });
  }

  setActive(topicId: number, type: ChunkType) {
    this.active.update(prev => ({ ...prev, [topicId]: type }));
    this.loadChunks(topicId, type);
  }

  private loadChunks(topicId: number, type: ChunkType) {
    this.api.listContent(topicId, this.lang.current(), type).subscribe(rows => {
      this.chunksByTopic.update(prev => ({ ...prev, [topicId]: rows }));
    });
  }
}
