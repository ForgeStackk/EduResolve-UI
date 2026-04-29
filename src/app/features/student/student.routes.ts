import { Routes } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'dashboard', component: StudentDashboardComponent },
      // Directing to the same component for example structure
      { path: 'learning', component: StudentDashboardComponent },
      { path: 'practice', component: StudentDashboardComponent },
      { path: 'doubts', component: StudentDashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];