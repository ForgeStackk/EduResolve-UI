import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LearningApiService, Subject } from '../../../core/api/learning-api.service';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-subjects-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './subjects-list.component.html',
  styleUrl: './subjects-list.component.css'
})
export class SubjectsListComponent implements OnInit {
  private api = inject(LearningApiService);
  protected lang = inject(LanguageService);

  subjects = signal<Subject[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.listSubjects().subscribe({
      next: rows => { this.subjects.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
