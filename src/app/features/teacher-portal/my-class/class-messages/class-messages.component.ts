import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TeacherPortalService } from '../../shared/services/teacher-portal.service';
import { RecipientType, SendMessageResponse } from '../../shared/models/teacher-portal.models';
import { MessageComposerComponent } from '../../shared/components/message-composer/message-composer.component';
import { environment } from '../../../../../environments/environment';

const GRADES = ['9', '10', '11', '12'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

export interface ClassOption {
  label: string;
  grade: string;
  section: string;
}

export interface GradeGroup {
  grade: string;
  options: ClassOption[];
}

@Component({
  selector: 'app-class-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MessageComposerComponent],
  templateUrl: './class-messages.component.html'
})
export class ClassMessagesComponent implements OnInit {
  readonly portal = inject(TeacherPortalService);
  private http = inject(HttpClient);

  @Input() selectedClassId = '';
  @Input() selectedClassName = '';

  recipientType = signal<RecipientType>('CLASS');
  lastSentCount = signal<number | null>(null);

  /** Currently resolved classId for the override selection. */
  overrideClassId = signal('');
  overrideLabel = signal('');
  resolving = signal(false);
  resolveError = signal('');

  /** Static grade groups — always visible regardless of DB state. */
  readonly gradeGroups: GradeGroup[] = GRADES.map(grade => ({
    grade,
    options: SECTIONS.map(section => ({
      label: `Class ${grade}-${section}`,
      grade,
      section,
    })),
  }));

  /** Selected dropdown key, e.g. "9_A" or "" for own class. */
  selectedKey = signal('');

  ngOnInit(): void {}

  onTargetChange(key: string): void {
    this.selectedKey.set(key);
    this.resolveError.set('');

    if (!key) {
      this.overrideClassId.set('');
      this.overrideLabel.set('');
      return;
    }

    const [grade, section] = key.split('_');
    const label = `Class ${grade}-${section}`;
    this.overrideLabel.set(label);
    this.resolving.set(true);

    this.http
      .get<{ classId: string }>(
        `${environment.apiBaseUrl}/auth/classroom-id?grade=${grade}&section=${section}`
      )
      .subscribe({
        next: res => {
          this.overrideClassId.set(res.classId);
          this.resolving.set(false);
        },
        error: () => {
          this.overrideClassId.set('');
          this.resolveError.set(`${label} not found in school database.`);
          this.resolving.set(false);
        },
      });
  }

  classId = computed(() =>
    this.overrideClassId() || this.selectedClassId || this.portal.classTeacherClass()?.classId || ''
  );

  className = computed(() => {
    if (this.overrideLabel()) return this.overrideLabel();
    if (this.selectedClassName) return this.selectedClassName;
    const c = this.portal.classTeacherClass();
    return c ? `${c.className}${c.section ? '-' + c.section : ''}` : '';
  });

  recipientLabel = computed(() =>
    this.recipientType() === 'ABSENT_GUARDIANS'
      ? `Absent guardians of ${this.className()}`
      : this.className() || 'Class'
  );

  readonly recipientOptions: { value: RecipientType; label: string }[] = [
    { value: 'CLASS',            label: 'Entire class' },
    { value: 'ABSENT_GUARDIANS', label: "Absent students' guardians" },
  ];

  onMessageSent(res: SendMessageResponse): void {
    this.lastSentCount.set(res.deliveredTo);
  }
}
