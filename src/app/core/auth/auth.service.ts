import { Injectable, signal } from '@angular/core';

export type Role = 'student' | 'teacher' | 'admin' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Mock-login as a seeded student. Matches the row created by `dummy_data.sql`:
  //   user_login.email = 'marcus.s@eduresolve.test', role = 'STUDENT', class_name = '10A'
  // To trial a different student, swap to one of the other seeded emails:
  //   elena.s@eduresolve.test | julian.s@eduresolve.test |
  //   nisha.s@eduresolve.test | arjun.s@eduresolve.test
  currentUser = signal<User | null>({
    id: 'marcus.s@eduresolve.test',
    name: 'Marcus Thomas',
    email: 'marcus.s@eduresolve.test',
    role: 'student'
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
}
