import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const role = authService.currentUser()?.role;
  const targetUrl = state.url;

  // If no user is logged in, redirect to the unauthorized page
  if (!role) {
    return router.createUrlTree(['/unauthorized']);
  }

  // If the user tries to navigate to a feature module that doesn't match their role
  if (!targetUrl.startsWith(`/${role}`)) {
    // Safely bounce them back to their own role's dashboard
    return router.createUrlTree([`/${role}/dashboard`]);
  }

  return true;
};