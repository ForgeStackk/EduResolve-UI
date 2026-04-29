import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/main-component/main-layout.component';
// import { authGuard } from './core/guards/auth.guard';
import { UnauthorizedComponent } from './core/components/unauthorized/unauthorized.component';

export const routes: Routes = [
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'student',
        loadChildren: () => import('./features/student/student.routes').then(m => m.STUDENT_ROUTES)
        // canActivate: [authGuard]
      },
      {
        path: 'teacher',
        loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.TEACHER_ROUTES)
        // canActivate: [authGuard]
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
        // canActivate: [authGuard]
      },
      {
        path: 'parent',
        loadChildren: () => import('./features/parent/parent.routes').then(m => m.PARENT_ROUTES)
        // canActivate: [authGuard]
      },
      {
        path: 'learn',
        loadChildren: () => import('./features/learning/learning.routes').then(m => m.LEARNING_ROUTES)
      },
      { path: '', redirectTo: 'student/dashboard', pathMatch: 'full' }
    ]
  }
];