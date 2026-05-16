import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const role = authService.currentUser()?.role;
  const targetUrl = state.url;

  // If no user is logged in, redirect to login page
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  // Allow all authenticated users to access /learn routes (shared learning platform)
  if (targetUrl.startsWith('/learn')) {
    return true;
  }

  // If the user tries to navigate to a feature module that doesn't match their role
  if (role && !targetUrl.startsWith(`/${role}`)) {
    // Safely bounce them back to their own role's dashboard
    return router.createUrlTree([`/${role}/dashboard`]);
  }

  return true;
};