import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export type Role = 'student' | 'teacher' | 'admin' | 'parent';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  name: string;
  email: string;
  role: Role;
  className?: string;
  phoneNumber?: string;
  schoolName?: string;
  /** Backend student-profile id (matches `students.id`). */
  studentId?: number;
  grade?: string;
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
  private router = inject(Router);

  currentUser = signal<User | null>(null);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUser.set(user);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('user');
      }
    }
  }

  login(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }

  hasRole(allowedRoles: Role[]): boolean {
    const user = this.currentUser();
    return user ? allowedRoles.includes(user.role) : false;
  }

  /** Convenience accessor for the currently logged-in student id (or null). */
  currentStudentId(): number | null {
    return this.currentUser()?.studentId ?? null;
  }

  /** Check if user is authenticated */
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
