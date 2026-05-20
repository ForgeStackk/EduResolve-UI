import { Routes } from '@angular/router';
import { ParentPortalComponent } from './parent-portal/parent-portal.component';
import { ParentInboxComponent } from './inbox/parent-inbox.component';

export const PARENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'dashboard', component: ParentPortalComponent },
      { path: 'inbox', component: ParentInboxComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];