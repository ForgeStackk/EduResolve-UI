import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AssignHomeworkComponent } from '../homework/assign/assign-homework.component';
import { ComposeMessageComponent } from '../messages/compose/compose-message.component';
import { ReportArchiveComponent } from '../archive/report-archive.component';

type AssignTab = 'homework' | 'messages' | 'archive';

@Component({
  selector: 'app-teacher-assignments',
  standalone: true,
  imports: [CommonModule, TranslateModule, AssignHomeworkComponent, ComposeMessageComponent, ReportArchiveComponent],
  templateUrl: './teacher-assignments.component.html'
})
export class TeacherAssignmentsComponent {
  activeTab = signal<AssignTab>('homework');

  readonly tabs: { id: AssignTab; labelKey: string; icon: string }[] = [
    { id: 'homework', labelKey: 'teacher.assignments.tabs.homework', icon: 'edit_note'   },
    { id: 'messages', labelKey: 'teacher.assignments.tabs.messages', icon: 'send'        },
    { id: 'archive',  labelKey: 'teacher.assignments.tabs.archive',  icon: 'inventory_2' },
  ];
}
