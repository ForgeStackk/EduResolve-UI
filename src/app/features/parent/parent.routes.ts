import { Routes } from '@angular/router';
import { ParentPortalComponent } from './parent-portal/parent-portal.component';

export const PARENT_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'dashboard', component: ParentPortalComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];