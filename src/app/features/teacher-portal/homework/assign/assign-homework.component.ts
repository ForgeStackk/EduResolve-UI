import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TeacherPortalService } from '../../shared/services/teacher-portal.service';
import { SendMessageResponse } from '../../shared/models/teacher-portal.models';
import { ClassSubjectDropdownComponent } from '../../shared/components/class-subject-dropdown/class-subject-dropdown.component';
import { MessageComposerComponent } from '../../shared/components/message-composer/message-composer.component';

/** Allowed document types for homework attachments. */
const HW_FILE_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip';

@Component({
  selector: 'app-assign-homework',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ClassSubjectDropdownComponent, MessageComposerComponent],
  templateUrl: './assign-homework.component.html'
})
export class AssignHomeworkComponent {
  protected portal = inject(TeacherPortalService);

  readonly hwFileAccept = HW_FILE_ACCEPT;

  selectedClassId   = signal('');
  selectedSubjectId = signal<number | null>(null);
  lastSentCount     = signal<number | null>(null);

  recipientLabel = computed(() => {
    const c = this.portal.classTeacherClass();
    return c ? `${c.className}-${c.section} students` : 'Class students';
  });

  onHomeworkSent(res: SendMessageResponse): void {
    this.lastSentCount.set(res.deliveredTo);
  }
}
