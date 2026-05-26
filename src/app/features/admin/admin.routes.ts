import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./students/admin-students.component').then(m => m.AdminStudentsComponent)
      },
      {
        path: 'fees',
        loadComponent: () => import('./fees/admin-fees.component').then(m => m.AdminFeesComponent)
      },
      {
        path: 'tickets',
        loadComponent: () => import('./tickets/admin-tickets.component').then(m => m.AdminTicketsComponent)
      },
      {
        path: 'broadcasts',
        loadComponent: () => import('./broadcasts/admin-broadcasts.component').then(m => m.AdminBroadcastsComponent)
      },
      {
        path: 'audit',
        loadComponent: () => import('./audit/admin-audit.component').then(m => m.AdminAuditComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./attendance/admin-attendance.component').then(m => m.AdminAttendanceComponent)
      },
      {
        path: 'attendance/policy',
        loadComponent: () => import('./attendance/policy/admin-attendance-policy.component').then(m => m.AdminAttendancePolicyComponent)
      },
      { path: 'users', redirectTo: 'students', pathMatch: 'full' },
      { path: '',      redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
