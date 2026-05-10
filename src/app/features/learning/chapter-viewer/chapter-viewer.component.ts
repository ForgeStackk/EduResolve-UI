import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule as MatIconModuleCore } from '@angular/material/icon';
import { NcertLearningService, ContentBlock, NcertChapter, NcertBook } from '../../../core/api/ncert-learning.service';

@Component({
  selector: 'app-chapter-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatIconModuleCore
  ],
  templateUrl: './chapter-viewer.component.html',
  styleUrls: ['./chapter-viewer.component.css']
})
export class ChapterViewerComponent implements OnInit {
  private ncertService = inject(NcertLearningService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Data
  chapterId = signal<number | null>(null);
  chapter = signal<NcertChapter | null>(null);
  book = signal<NcertBook | null>(null);
  contentBlocks = signal<ContentBlock[]>([]);
  
  // UI state
  loading = signal<boolean>(false);
  error = signal<string>('');

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.chapterId.set(parseInt(id));
        this.loadChapterContent();
      }
    });

    // Get book info from query params
    this.route.queryParams.subscribe(params => {
      if (params['bookId']) {
        this.loadBookInfo(parseInt(params['bookId']));
      }
    });
  }

  loadChapterContent(): void {
    if (!this.chapterId()) return;
    
    this.loading.set(true);
    this.error.set('');
    
    this.ncertService.getChapterContent(this.chapterId()!).subscribe({
      next: (contentBlocks) => {
        this.contentBlocks.set(contentBlocks);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading chapter content:', error);
        this.error.set('Failed to load chapter content. Please try again.');
        this.snackBar.open('Failed to load chapter content', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  loadBookInfo(bookId: number): void {
    this.ncertService.getBooks('', '').subscribe({
      next: (books) => {
        const foundBook = books.find(b => b.id === bookId);
        if (foundBook) {
          this.book.set(foundBook);
        }
      },
      error: (error) => {
        console.error('Error loading book info:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/learn/book-browser']);
  }

  viewPdf(): void {
    if (!this.book()) return;
    
    this.router.navigate(['/learn/pdf-viewer'], {
      queryParams: {
        bookId: this.book()?.id,
        title: this.book()?.title
      }
    });
  }

  startQuiz(): void {
    if (!this.book()) return;
    
    this.router.navigate(['/learn/quiz'], {
      queryParams: {
        bookId: this.book()?.id,
        chapterId: this.chapterId(),
        bookTitle: this.book()?.title
      }
    });
  }

  askAI(): void {
    this.router.navigate(['/learn/ai-qa'], {
      queryParams: {
        chapterId: this.chapterId(),
        bookTitle: this.book()?.title
      }
    });
  }

  // Helper methods for content rendering
  isHeadingBlock(block: ContentBlock): boolean {
    return block.blockType === 'HEADING';
  }

  isTextBlock(block: ContentBlock): boolean {
    return block.blockType === 'TEXT';
  }

  isImageBlock(block: ContentBlock): boolean {
    return block.blockType === 'IMAGE' || block.blockType === 'DIAGRAM';
  }

  isTableBlock(block: ContentBlock): boolean {
    return block.blockType === 'TABLE';
  }

  getBlockIcon(block: ContentBlock): string {
    switch (block.blockType) {
      case 'HEADING': return 'title';
      case 'TEXT': return 'article';
      case 'IMAGE': 
      case 'DIAGRAM': return 'image';
      case 'TABLE': return 'table_chart';
      default: return 'description';
    }
  }

  getBlockTitle(block: ContentBlock): string {
    switch (block.blockType) {
      case 'HEADING': return 'Heading';
      case 'TEXT': return 'Content';
      case 'IMAGE': return 'Image';
      case 'DIAGRAM': return 'Diagram';
      case 'TABLE': return 'Table';
      default: return 'Content';
    }
  }

  formatContentText(text: string): string {
    if (!text) return '';
    
    // Replace multiple newlines with paragraph breaks
    return text
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/, '<p>$1</p>');
  }

  // Navigation methods
  scrollToBlock(blockId: number): void {
    const element = document.getElementById(`block-${blockId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  printChapter(): void {
    window.print();
  }

  // Table of contents generation
  getTableOfContents(): ContentBlock[] {
    return this.contentBlocks()
      .filter(block => block.blockType === 'HEADING')
      .slice(0, 10); // Limit to first 10 headings
  }
}
