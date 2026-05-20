import { Routes } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { StudentInboxComponent } from './inbox/student-inbox.component';

export const STUDENT_ROUTES: Routes = [
  { path: 'dashboard', component: StudentDashboardComponent },
  { path: 'inbox', component: StudentInboxComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];