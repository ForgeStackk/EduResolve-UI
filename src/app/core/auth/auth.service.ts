import { Injectable, signal } from '@angular/core';

export type Role = 'student' | 'teacher' | 'admin' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Backend student-profile id (matches `students.id`). */
  studentId?: number;
}

/**
 * Default mock-login profile (matches the seeded `dummy_data.sql` row for
 * Marcus Thomas, class 10A, student id 1). Used as a fallback when the
 * `/students/{id}` API is unreachable.
 */
export const MOCK_STUDENT_PROFILE = {
  id: 1,
  userId: null,
  name: 'Marcus Thomas',
  initials: 'MT',
  color: '#667eea',
  engagement: 92,
  grade: 'A+',
  status: 'excellent',
  className: '10A',
  streakDays: 12,
  experiencePoints: 450,
  topPercentage: 3
} as const;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Mock-login as the seeded student "Marcus Thomas" (student id = 1, 10A).
  // Switch to a different student by changing studentId here.
  currentUser = signal<User | null>({
    id: 'marcus.s@eduresolve.test',
    name: MOCK_STUDENT_PROFILE.name,
    email: 'marcus.s@eduresolve.test',
    role: 'student',
    studentId: MOCK_STUDENT_PROFILE.id
  });

  login(user: User): void {
    this.currentUser.set(user);
  }

  logout(): void {
    this.currentUser.set(null);
  }

  hasRole(allowedRoles: Role[]): boolean {
    const user = this.currentUser();
    return user ? allowedRoles.includes(user.role) : false;
  }

  /** Convenience accessor for the currently logged-in student id (or null). */
  currentStudentId(): number | null {
    return this.currentUser()?.studentId ?? null;
  }
}
