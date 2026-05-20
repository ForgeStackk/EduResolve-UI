import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NcertApiService } from '../../../core/api/ncert-api.service';
import { ClassContextService } from '../../../core/class-context.service';
import { SubjectCatalogService } from '../../../core/subject-catalog.service';

@Component({
  selector: 'app-ncert-browser',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './ncert-browser.component.html',
  styleUrl: './ncert-browser.component.css'
})
export class NcertBrowserComponent implements OnInit {
  private router   = inject(Router);
  private classCtx = inject(ClassContextService);
  readonly catalog  = inject(SubjectCatalogService);

  get subjects() { return this.catalog.subjects; }

  selectedGrade   = signal<string>('');
  selectedSubject = signal<string>('');

  get selectedSubjectValue(): string { return this.selectedSubject(); }
  set selectedSubjectValue(v: string) { this.selectedSubject.set(v); }

  ngOnInit(): void {
    const grade = this.classCtx.grade();
    this.selectedGrade.set(grade);
    this.catalog.load();
    this.catalog.getSubjects(grade).subscribe(list => {
      if (list.length > 0 && !this.selectedSubject()) {
        this.selectedSubject.set(list[0]);
      }
    });
  }

  onSearch(): void {
    const subject = this.selectedSubject();
    const grade   = this.selectedGrade();
    if (!subject || !grade) return;
    // Delegate to the book-browser which handles single vs multi-book logic
    this.router.navigate(['/learn/books'], {
      queryParams: { classGrade: grade, subject }
    });
  }
}
