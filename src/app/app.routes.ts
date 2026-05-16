import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/main-component/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { UnauthorizedComponent } from './core/components/unauthorized/unauthorized.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/signup', component: SignupComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'signup', redirectTo: 'auth/signup', pathMatch: 'full' },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'student',
        loadChildren: () => import('./features/student/student.routes').then(m => m.STUDENT_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'teacher',
        loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.TEACHER_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'parent',
        loadChildren: () => import('./features/parent/parent.routes').then(m => m.PARENT_ROUTES),
        canActivate: [authGuard]
      },
      {
        path: 'learn',
        loadChildren: () => import('./features/learning/learning.routes').then(m => m.LEARNING_ROUTES),
        canActivate: [authGuard]
      }
    ]
  }
];