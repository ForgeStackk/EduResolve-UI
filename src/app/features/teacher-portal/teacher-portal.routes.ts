import { Routes } from '@angular/router';
import { classTeacherGuard } from './shared/guards/class-teacher.guard';

export const TEACHER_PORTAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./teacher-portal.component').then(m => m.TeacherPortalComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../teacher/teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent)
      },
      {
        path: 'classes',
        loadComponent: () =>
          import('./teacher-classes/teacher-classes.component').then(m => m.TeacherClassesComponent)
      },
      {
        path: 'assignments',
        loadComponent: () =>
          import('./teacher-assignments/teacher-assignments.component').then(m => m.TeacherAssignmentsComponent)
      },

      // My Class (class-teacher only)
      {
        path: 'my-class',
        canActivate: [classTeacherGuard],
        loadComponent: () =>
          import('./my-class/my-class.component').then(m => m.MyClassComponent),
        children: [
          { path: '', redirectTo: 'attendance', pathMatch: 'full' },
          {
            path: 'attendance',
            loadComponent: () =>
              import('./my-class/attendance/attendance.component').then(m => m.AttendanceComponent)
          },
          {
            path: 'messages',
            loadComponent: () =>
              import('./my-class/class-messages/class-messages.component').then(m => m.ClassMessagesComponent)
          },
          {
            path: 'reports',
            loadComponent: () =>
              import('./my-class/reports/reports.component').then(m => m.ReportsComponent)
          }
        ]
      },

      // Student Doubt Inbox
      {
        path: 'doubts',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./doubts/teacher-doubt-inbox.component').then(m => m.TeacherDoubtInboxComponent)
          },
          {
            path: ':threadId',
            loadComponent: () =>
              import('./doubts/teacher-doubt-thread.component').then(m => m.TeacherDoubtThreadComponent)
          }
        ]
      },

      // Report Archive — read-only, visible to all teachers (incl. reassigned ones)
      {
        path: 'archive',
        loadComponent: () =>
          import('./archive/report-archive.component').then(m => m.ReportArchiveComponent)
      },

      // Messages
      {
        path: 'messages',
        children: [
          { path: '', redirectTo: 'compose', pathMatch: 'full' },
          {
            path: 'compose',
            loadComponent: () =>
              import('./messages/compose/compose-message.component').then(m => m.ComposeMessageComponent)
          },
          {
            path: 'sent',
            loadComponent: () =>
              import('./messages/sent/sent-messages.component').then(m => m.SentMessagesComponent)
          }
        ]
      },

      // Homework
      {
        path: 'homework',
        children: [
          { path: '', redirectTo: 'assign', pathMatch: 'full' },
          {
            path: 'assign',
            loadComponent: () =>
              import('./homework/assign/assign-homework.component').then(m => m.AssignHomeworkComponent)
          },
          {
            path: 'sent',
            loadComponent: () =>
              import('./homework/sent/sent-homework.component').then(m => m.SentHomeworkComponent)
          }
        ]
      }
    ]
  }
];
