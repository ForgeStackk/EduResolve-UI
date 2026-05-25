import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, Role } from '../auth/auth.service';

/**
 * Factory that returns a CanActivateFn guarding a single role.
 * Usage: canActivate: [roleGuard('admin')]
 */
export const roleGuard = (role: Role): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router      = inject(Router);

    if (authService.hasRole([role])) return true;
    return router.parseUrl('/unauthorized');
  };
};
