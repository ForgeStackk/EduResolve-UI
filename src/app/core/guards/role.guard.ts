import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, Role } from '../auth/auth.service';

export const roleGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Extract expected roles from route data
  const expectedRoles = route.data?.['roles'] as Role[];

  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  if (authService.hasRole(expectedRoles)) {
    return true;
  }

  return router.parseUrl('/unauthorized');
};