import { Routes } from '@angular/router';
import { TeacherDashboardComponent } from './teacher-dashboard/teacher-dashboard.component';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'dashboard', component: TeacherDashboardComponent },
      // Using dashboard component for placeholders
      { path: 'classes', component: TeacherDashboardComponent },
      { path: 'assignments', component: TeacherDashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];