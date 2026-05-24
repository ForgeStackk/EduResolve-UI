import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TeacherPortalService } from '../../shared/services/teacher-portal.service';
import { RecipientType, SendMessageResponse } from '../../shared/models/teacher-portal.models';
import { ClassSubjectDropdownComponent } from '../../shared/components/class-subject-dropdown/class-subject-dropdown.component';
import { MessageComposerComponent } from '../../shared/components/message-composer/message-composer.component';

@Component({
  selector: 'app-compose-message',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ClassSubjectDropdownComponent, MessageComposerComponent],
  templateUrl: './compose-message.component.html'
})
export class ComposeMessageComponent {
  protected portal = inject(TeacherPortalService);

  selectedClassId   = signal('');
  selectedSubjectId = signal<number | null>(null);
  recipientType     = signal<RecipientType>('CLASS');
  lastSentCount     = signal<number | null>(null);

  readonly recipientOptions: { value: RecipientType; labelKey: string }[] = [
    { value: 'CLASS',            labelKey: 'teacher.messages.entireClass'     },
    { value: 'ABSENT_GUARDIANS', labelKey: 'teacher.messages.absentGuardians' },
  ];

  recipientLabel = computed(() => {
    const cls = this.portal.classTeacherClass();
    const base = cls ? `${cls.className}-${cls.section}` : 'Class';
    return this.recipientType() === 'ABSENT_GUARDIANS' ? `Absent guardians of ${base}` : base;
  });

  onMessageSent(res: SendMessageResponse): void {
    this.lastSentCount.set(res.deliveredTo);
  }
}
