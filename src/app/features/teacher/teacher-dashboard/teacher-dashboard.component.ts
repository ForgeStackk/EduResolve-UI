import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherPortalService } from '../../../features/teacher-portal/shared/services/teacher-portal.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent {
  readonly portal = inject(TeacherPortalService);

  classLabel = computed(() => {
    const c = this.portal.classTeacherClass();
    if (!c) return '';
    return c.section ? `CLASS ${c.className}-${c.section}` : `CLASS ${c.className}`;
  });
}
