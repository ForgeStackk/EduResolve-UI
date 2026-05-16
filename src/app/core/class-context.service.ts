import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth/auth.service';

/**
 * Single source of truth for the logged-in student's class/grade context.
 *
 * ALL subject and chapter queries must be scoped to this grade — no component
 * is allowed to read grade independently or expose a class-selection UI.
 */
@Injectable({ providedIn: 'root' })
export class ClassContextService {
  private auth = inject(AuthService);

  /** Numeric grade string extracted from the user's className ("10A" → "10"). */
  readonly grade = computed<string>(() => {
    const user = this.auth.currentUser();
    const raw  = user?.className ?? user?.grade ?? '9';
    const numeric = raw.replace(/[^0-9]/g, '');
    return numeric || '9';
  });

  /** Full class string as stored in the profile (e.g., "10A"). */
  readonly className = computed<string>(() => {
    return this.auth.currentUser()?.className ?? '';
  });

  /** Display label shown in locked-class badges ("Class 10"). */
  readonly classLabel = computed<string>(() => `Class ${this.grade()}`);
}
