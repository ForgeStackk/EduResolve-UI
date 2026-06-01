import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NotesApiService, NoteListItem, NoteStats } from '../../../../core/api/notes-api.service';
import { GenerateNoteComponent } from '../generate-note/generate-note.component';

@Component({
  selector: 'app-notes-library',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, GenerateNoteComponent],
  templateUrl: './notes-library.component.html'
})
export class NotesLibraryComponent implements OnInit {
  private api      = inject(NotesApiService);
  private router   = inject(Router);
  private location = inject(Location);

  goBack(): void { this.location.back(); }

  tab        = signal<'library' | 'trash'>('library');
  notes      = signal<NoteListItem[]>([]);
  trash      = signal<NoteListItem[]>([]);
  stats      = signal<NoteStats | null>(null);
  loading    = signal(false);
  search     = signal('');
  showGenerate = signal(false);

  totalPages = signal(0);
  page       = signal(0);

  limitReached = computed(() => {
    const s = this.stats();
    return s ? s.dailyLimitRemaining <= 0 : false;
  });

  dailyUsed = computed(() => {
    const s = this.stats();
    return s ? s.notesGeneratedToday : 0;
  });

  dailyLimit = computed(() => {
    const s = this.stats();
    if (!s) return 20;
    return s.notesGeneratedToday + s.dailyLimitRemaining;
  });

  dailyRemaining = computed(() => this.stats()?.dailyLimitRemaining ?? 20);

  showWarning = computed(() => {
    const s = this.stats();
    if (!s || this.limitReached()) return false;
    const limit = s.notesGeneratedToday + s.dailyLimitRemaining;
    return s.notesGeneratedToday >= Math.floor(limit * 0.75);
  });

  ngOnInit(): void {
    this.loadNotes();
    this.loadStats();
  }

  loadNotes(): void {
    this.loading.set(true);
    const q = this.search().trim() || undefined;
    this.api.list({ search: q, page: this.page(), size: 30 }).subscribe({
      next: res => {
        this.notes.set(res.content);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadTrash(): void {
    this.loading.set(true);
    this.api.trash().subscribe({
      next: items => { this.trash.set(items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadStats(): void {
    this.api.stats().subscribe({ next: s => this.stats.set(s), error: () => {} });
  }

  setTab(t: 'library' | 'trash'): void {
    this.tab.set(t);
    if (t === 'trash') this.loadTrash();
  }

  openNote(note: NoteListItem): void {
    this.router.navigate(['/student/notes', note.id]);
  }

  onSearch(val: string): void {
    this.search.set(val);
    this.page.set(0);
    this.loadNotes();
  }

  togglePin(note: NoteListItem, event: MouseEvent): void {
    event.stopPropagation();
    const op = note.isPinned ? this.api.unpin(note.id) : this.api.pin(note.id);
    op.subscribe({ next: () => this.loadNotes(), error: () => {} });
  }

  deleteNote(note: NoteListItem, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm(note.title + ' → Trash?')) return;
    this.api.softDelete(note.id).subscribe({ next: () => this.loadNotes(), error: () => {} });
  }

  restoreNote(note: NoteListItem, event: MouseEvent): void {
    event.stopPropagation();
    this.api.restore(note.id).subscribe({
      next: () => { this.loadTrash(); this.loadStats(); },
      error: () => {}
    });
  }

  onGenerateDone(): void {
    this.showGenerate.set(false);
    this.loadNotes();
    this.loadStats();
  }

  prevPage(): void {
    if (this.page() > 0) { this.page.update(p => p - 1); this.loadNotes(); }
  }

  nextPage(): void {
    if (this.page() < this.totalPages() - 1) { this.page.update(p => p + 1); this.loadNotes(); }
  }

  sourceIcon(sourceType: string): string {
    const map: Record<string, string> = {
      TOPIC_INPUT: 'edit', CHAPTER: 'menu_book', PDF_UPLOAD: 'picture_as_pdf',
      VOICE: 'mic', PHOTO_OCR: 'photo_camera', DOUBT_THREAD: 'forum', MANUAL: 'notes'
    };
    return map[sourceType] ?? 'notes';
  }

  daysInTrash(deletedAt: string): number {
    return Math.floor((Date.now() - new Date(deletedAt).getTime()) / 86_400_000);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
