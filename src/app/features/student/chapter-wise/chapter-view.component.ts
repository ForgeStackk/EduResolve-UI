import { Component, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Chapter {
  id: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-chapter-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chapter-view.component.html',
  styleUrl: './chapter-view.component.css'
})
export class ChapterViewComponent {
  chapter = signal<Chapter | null>(null);
  isOffline = signal(false);

  constructor() {
    // afterNextRender ensures localStorage is only accessed in the browser to avoid SSR crashing
    afterNextRender(() => {
      const saved = localStorage.getItem('offline_chapter_sci_10_1');
      if (saved) {
        this.chapter.set(JSON.parse(saved));
        this.isOffline.set(true);
      } else {
        this.chapter.set({
          id: 'sci_10_1',
          title: 'Chapter 10: Light – Reflection and Refraction',
          content: 'Light seems to travel in straight lines. The fact that a small source of light casts a sharp shadow of an opaque object points to this straight-line path of light, usually indicated as a ray of light. In this chapter, we shall study the phenomena of reflection and refraction of light using the straight-line propagation of light.'
        });
      }
    });
  }

  toggleOffline() {
    const current = this.chapter();
    if (!current) return;

    if (this.isOffline()) {
      localStorage.removeItem(`offline_chapter_${current.id}`);
      this.isOffline.set(false);
    } else {
      localStorage.setItem(`offline_chapter_${current.id}`, JSON.stringify(current));
      this.isOffline.set(true);
    }
  }
}