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

  /** Letter section extracted from the user's className ("10A" → "A"). */
  readonly section = computed<string>(() => {
    const raw = this.auth.currentUser()?.className ?? '';
    return raw.replace(/[0-9]/g, '').toUpperCase() || '';
  });

  /** Full class string as stored in the profile (e.g., "10A"). */
  readonly className = computed<string>(() => {
    return this.auth.currentUser()?.className ?? '';
  });

  /** Display label shown in locked-class badges ("Class 10" or "Class 10-A"). */
  readonly classLabel = computed<string>(() => {
    const s = this.section();
    return s ? `Class ${this.grade()}-${s}` : `Class ${this.grade()}`;
  });
}
