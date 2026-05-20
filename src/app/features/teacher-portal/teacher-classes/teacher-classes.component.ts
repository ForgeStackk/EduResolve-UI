import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherPortalService } from '../shared/services/teacher-portal.service';
import { TeacherClass, StudentRow } from '../shared/models/teacher-portal.models';
import { AttendanceComponent } from '../my-class/attendance/attendance.component';
import { ClassMessagesComponent } from '../my-class/class-messages/class-messages.component';
import { ReportsComponent } from '../my-class/reports/reports.component';

type ClassTab = 'roster' | 'attendance' | 'messages' | 'reports';

@Component({
  selector: 'app-teacher-classes',
  standalone: true,
  imports: [CommonModule, AttendanceComponent, ClassMessagesComponent, ReportsComponent],
  templateUrl: './teacher-classes.component.html'
})
export class TeacherClassesComponent implements OnInit {
  readonly portal = inject(TeacherPortalService);

  activeTab = signal<ClassTab>('roster');
  students  = signal<StudentRow[]>([]);
  loading   = signal(false);
  error     = signal<string | null>(null);

  isClassTeacher = this.portal.isClassTeacher;
  ctClass        = this.portal.classTeacherClass;

  classes = computed(() => this.portal.myClasses() ?? []);

  selectedClass = signal<TeacherClass | null>(null);

  tabs = computed<{ id: ClassTab; label: string; icon: string; ctOnly: boolean }[]>(() => [
    { id: 'roster',     label: 'ROSTER',     icon: 'groups',          ctOnly: false },
    { id: 'messages',   label: 'MESSAGES',   icon: 'forum',           ctOnly: false },
    { id: 'attendance', label: 'ATTENDANCE', icon: 'fact_check',      ctOnly: true  },
    { id: 'reports',    label: 'REPORTS',    icon: 'assessment',      ctOnly: true  },
  ]);

  visibleTabs = computed(() =>
    this.tabs().filter(t => !t.ctOnly || this.isClassTeacher())
  );

  ngOnInit(): void {
    const already = this.portal.myClasses();
    if (already && already.length > 0) {
      this.setupClass(already);
    } else {
      this.portal.loadMyClasses().subscribe(cls => this.setupClass(cls));
    }
  }

  private setupClass(classes: TeacherClass[]): void {
    if (!classes.length) return;
    const ct = classes.find(c => c.isClassTeacher) ?? classes[0];
    this.selectedClass.set(ct);
    this.loadRoster(ct.classId);
  }

  selectClass(cls: TeacherClass): void {
    this.selectedClass.set(cls);
    this.loadRoster(cls.classId);
  }

  setTab(tab: ClassTab): void {
    this.activeTab.set(tab);
    if (tab === 'roster' && this.selectedClass()) {
      this.loadRoster(this.selectedClass()!.classId);
    }
  }

  private loadRoster(classId: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.portal.getStudentsWithParents(classId).subscribe({
      next:  rows => { this.students.set(rows); this.loading.set(false); },
      error: ()   => { this.error.set('Could not load roster.'); this.loading.set(false); }
    });
  }
}
