import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeacherPortalService } from '../../shared/services/teacher-portal.service';
import { RecipientType, SendMessageResponse } from '../../shared/models/teacher-portal.models';
import { MessageComposerComponent } from '../../shared/components/message-composer/message-composer.component';

@Component({
  selector: 'app-class-messages',
  standalone: true,
  imports: [CommonModule, RouterModule, MessageComposerComponent],
  templateUrl: './class-messages.component.html'
})
export class ClassMessagesComponent {
  readonly portal = inject(TeacherPortalService);

  recipientType = signal<RecipientType>('CLASS');
  lastSentCount = signal<number | null>(null);

  classId = computed(() => this.portal.classTeacherClass()?.classId ?? '');
  className = computed(() => {
    const c = this.portal.classTeacherClass();
    return c ? `${c.className}-${c.section}` : '';
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
