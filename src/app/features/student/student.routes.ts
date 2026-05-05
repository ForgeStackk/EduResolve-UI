import { Routes } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
/**
 * The student-only route is the home dashboard. All other learning experiences
 * (subjects, chapters, quiz, PYQs, doubt solver, bookmarks) live under
 * `/learn/**` and are exposed in the sidebar.
 */
export const STUDENT_ROUTES: Routes = [
  { path: 'dashboard', component: StudentDashboardComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];