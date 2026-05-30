import {
  Component, OnInit, OnDestroy, AfterViewChecked,
  inject, signal, computed, ElementRef, ViewChild, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NotesApiService, NoteDetail, NoteVersion, NoteListItem } from '../../../../core/api/notes-api.service';

type Tab = 'content' | 'versions';

@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './note-detail.component.html'
})
export class NoteDetailComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('contentEl') contentEl?: ElementRef<HTMLDivElement>;

  private api        = inject(NotesApiService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private platformId = inject(PLATFORM_ID);

  note       = signal<NoteDetail | null>(null);
  versions   = signal<NoteVersion[]>([]);
  related    = signal<NoteListItem[]>([]);
  loading    = signal(true);
  editing    = signal(false);
  saving     = signal(false);
  tab        = signal<Tab>('content');

  editTitle   = signal('');
  editContent = signal('');

  renderedHtml = signal('');
  private mermaidReady = false;
  private needsMermaid = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('noteId'));
    if (!id) { this.router.navigate(['/student/notes']); return; }
    this.loadNote(id);
  }

  private loadNote(id: number): void {
    this.loading.set(true);
    this.api.get(id).subscribe({
      next: note => {
        this.note.set(note);
        this.loading.set(false);
        this.renderMarkdown(note.content);
        this.loadRelated(id);
      },
      error: () => { this.loading.set(false); this.router.navigate(['/student/notes']); }
    });
  }

  private loadRelated(id: number): void {
    this.api.related(id).subscribe({ next: r => this.related.set(r), error: () => {} });
  }

  private async renderMarkdown(content: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const { marked } = await import('marked');
    let html = await marked.parse(content ?? '');
    this.renderedHtml.set(html);
    this.needsMermaid = content?.includes('```mermaid') ?? false;

    if (this.needsMermaid && !this.mermaidReady) {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
      this.mermaidReady = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.needsMermaid && this.mermaidReady && this.contentEl) {
      this.renderMermaidBlocks();
    }
  }

  private async renderMermaidBlocks(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.needsMermaid = false;
    const blocks = this.contentEl!.nativeElement.querySelectorAll<HTMLElement>('code.language-mermaid');
    if (!blocks.length) return;
    const mermaid = (await import('mermaid')).default;
    let idx = 0;
    for (const block of Array.from(blocks)) {
      const id = `mermaid-${Date.now()}-${idx++}`;
      const src = block.textContent ?? '';
      const parent = block.parentElement!;
      parent.id = id;
      parent.classList.add('mermaid-wrapper');
      try {
        const { svg } = await mermaid.render(id + '-svg', src);
        parent.innerHTML = svg;
      } catch { /* leave raw code if Mermaid fails */ }
    }
  }

  // ── Versions tab ─────────────────────────────────────────────────────────

  openVersions(): void {
    this.tab.set('versions');
    if (this.versions().length === 0 && this.note()) {
      this.api.versions(this.note()!.id).subscribe({ next: v => this.versions.set(v), error: () => {} });
    }
  }

  restoreVersion(v: NoteVersion): void {
    if (!this.note()) return;
    if (!confirm('Restore version ' + v.versionNumber + '?')) return;
    this.api.restoreVersion(this.note()!.id, v.id).subscribe({
      next: updated => {
        this.note.set(updated);
        this.renderMarkdown(updated.content);
        this.tab.set('content');
        this.versions.set([]);
      },
      error: () => {}
    });
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  startEdit(): void {
    const n = this.note();
    if (!n) return;
    this.editTitle.set(n.title);
    this.editContent.set(n.content);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  saveEdit(): void {
    const n = this.note();
    if (!n) return;
    this.saving.set(true);
    this.api.update(n.id, { title: this.editTitle(), content: this.editContent() }).subscribe({
      next: updated => {
        this.note.set(updated);
        this.renderMarkdown(updated.content);
        this.editing.set(false);
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  togglePin(): void {
    const n = this.note();
    if (!n) return;
    const op = n.isPinned ? this.api.unpin(n.id) : this.api.pin(n.id);
    op.subscribe({ next: () => this.note.update(note => note ? { ...note, isPinned: !note.isPinned } : null), error: () => {} });
  }

  deleteNote(): void {
    const n = this.note();
    if (!n || !confirm('Move to trash?')) return;
    this.api.softDelete(n.id).subscribe({ next: () => this.router.navigate(['/student/notes']), error: () => {} });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  openRelated(note: NoteListItem): void {
    this.router.navigate(['/student/notes', note.id]);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy(): void {}
}
