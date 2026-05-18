import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { TeacherPortalService } from '../services/teacher-portal.service';

export const classTeacherGuard: CanActivateFn = () => {
  const portalService = inject(TeacherPortalService);
  const router = inject(Router);

  const fallback = router.createUrlTree(['/teacher/messages/compose']);

  // If classes are already loaded (cached in signal), resolve synchronously.
  const cached = portalService.myClasses();
  if (cached !== null) {
    return portalService.isClassTeacher() || fallback;
  }

  // Not yet loaded — fetch once, then resolve.
  return portalService.loadMyClasses().pipe(
    map(classes => classes.some(c => c.isClassTeacher) || fallback),
    catchError(() => of(fallback))
  );
};
