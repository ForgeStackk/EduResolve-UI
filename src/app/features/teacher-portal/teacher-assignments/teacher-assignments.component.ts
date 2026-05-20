import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssignHomeworkComponent } from '../homework/assign/assign-homework.component';
import { ComposeMessageComponent } from '../messages/compose/compose-message.component';
import { ReportArchiveComponent } from '../archive/report-archive.component';

type AssignTab = 'homework' | 'messages' | 'archive';

@Component({
  selector: 'app-teacher-assignments',
  standalone: true,
  imports: [CommonModule, AssignHomeworkComponent, ComposeMessageComponent, ReportArchiveComponent],
  templateUrl: './teacher-assignments.component.html'
})
export class TeacherAssignmentsComponent {
  activeTab = signal<AssignTab>('homework');

  readonly tabs: { id: AssignTab; label: string; icon: string }[] = [
    { id: 'homework', label: 'HOMEWORK',  icon: 'edit_note'  },
    { id: 'messages', label: 'MESSAGES',  icon: 'send'       },
    { id: 'archive',  label: 'ARCHIVE',   icon: 'inventory_2' },
  ];
}
