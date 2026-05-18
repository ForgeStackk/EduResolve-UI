import { Routes } from '@angular/router';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('../teacher-portal/teacher-portal.routes').then(m => m.TEACHER_PORTAL_ROUTES)
  }
];
