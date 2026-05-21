import { Routes } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { StudentInboxComponent } from './inbox/student-inbox.component';
import { HomeworkSubmitComponent } from './homework-submit/homework-submit.component';
import { StudentDoubtsComponent } from './doubts/student-doubts.component';
import { DoubtThreadComponent } from './doubt-thread/doubt-thread.component';

export const STUDENT_ROUTES: Routes = [
  { path: 'dashboard',            component: StudentDashboardComponent },
  { path: 'inbox',                component: StudentInboxComponent     },
  { path: 'homework/submit',      component: HomeworkSubmitComponent   },
  { path: 'doubts',               component: StudentDoubtsComponent    },
  { path: 'doubts/:threadId',     component: DoubtThreadComponent      },
  { path: '',                     redirectTo: 'dashboard', pathMatch: 'full' }
];