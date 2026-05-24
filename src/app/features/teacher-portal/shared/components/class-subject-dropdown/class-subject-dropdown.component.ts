import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TeacherPortalService } from '../../services/teacher-portal.service';
import { TeacherClass, TeacherSubject } from '../../models/teacher-portal.models';

@Component({
  selector: 'app-class-subject-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './class-subject-dropdown.component.html'
})
export class ClassSubjectDropdownComponent implements OnInit {
  private portal = inject(TeacherPortalService);

  /** When true, loads every class in the school instead of only the teacher's own. */
  allClasses = input<boolean>(false);

  classChanged = output<string>();
  subjectChanged = output<number | null>();

  classes = signal<TeacherClass[]>([]);
  subjects = signal<TeacherSubject[]>([]);
  selectedClassId = signal('');
  selectedSubjectId = signal<number | null>(null);

  ngOnInit(): void {
    if (this.allClasses()) {
      this.portal.getAllClasses().subscribe({
        next: c => this.classes.set(c),
        error: () => this.loadOwn()
      });
    } else {
      this.loadOwn();
    }
  }

  private loadOwn(): void {
    const cached = this.portal.myClasses();
    if (cached?.length) {
      this.classes.set(cached);
    } else {
      this.portal.loadMyClasses().subscribe(c => this.classes.set(c));
    }
  }

  onClassChange(classId: string): void {
    this.selectedClassId.set(classId);
    this.selectedSubjectId.set(null);
    this.subjects.set([]);
    this.classChanged.emit(classId);
    this.subjectChanged.emit(null);

    if (!classId) return;
    this.portal.getMySubjects(classId).subscribe(s => this.subjects.set(s));
  }

  onSubjectChange(subjectId: string): void {
    const id = subjectId ? Number(subjectId) : null;
    this.selectedSubjectId.set(id);
    this.subjectChanged.emit(id);
  }
}
