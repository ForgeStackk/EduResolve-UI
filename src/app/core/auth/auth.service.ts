import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { firstValueFrom, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'edu_token';

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

const oidcConfig: AuthConfig = {
  issuer: environment.keycloakIssuer,
  clientId: environment.keycloakClientId,
  redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: !environment.production,
  clearHashAfterLogin: false,
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router    = inject(Router);
  private http      = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private oauthService = inject(OAuthService);

  currentUser = signal<User | null>(null);

  async initOidc(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    // Restore custom JWT session — skip Keycloak entirely if already logged in
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try { this.currentUser.set(JSON.parse(storedUser)); } catch { /* ignore */ }
      return;
    }

    this.oauthService.configure(oidcConfig);
    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    } catch {
      this.currentUser.set(null);
      return;
    }

    if (this.oauthService.hasValidAccessToken()) {
      await this.loadUserProfile();
    } else {
      this.currentUser.set(null);
      localStorage.removeItem('user');
    }
  }

  loginWithCredentials(identifier: string, password: string): Observable<void> {
    return this.http.post<any>(`${environment.apiBaseUrl}/auth/login`, {
      username: identifier,
      email:    identifier,
      password,
    }).pipe(
      tap(res => {
        if (!res.success) throw new Error(res.message ?? 'Login failed');
        localStorage.setItem(TOKEN_KEY, res.token);
        const user: User = {
          id:          String(res.id),
          firstName:   res.firstName,
          lastName:    res.lastName,
          username:    res.username,
          name:        `${res.firstName} ${res.lastName}`,
          email:       res.email,
          role:        res.role as Role,
          className:   res.className,
          grade:       res.className,
          phoneNumber: res.phoneNumber,
          schoolName:  res.schoolName,
          studentId:   res.studentId ?? undefined,
        };
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      }),
      map(() => void 0)
    );
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.currentUser.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(TOKEN_KEY) ?? this.oauthService.getAccessToken();
  }

  getRoles(): string[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const claims = this.oauthService.getIdentityClaims() as any;
      return claims?.realm_access?.roles ?? [];
    } catch {
      return [];
    }
  }

  hasRole(allowedRoles: Role[]): boolean {
    const user = this.currentUser();
    return user ? allowedRoles.includes(user.role) : false;
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!localStorage.getItem(TOKEN_KEY) || this.oauthService.hasValidAccessToken();
  }

  currentStudentId(): number | null {
    return this.currentUser()?.studentId ?? null;
  }

  redirectToDashboard(): void {
    const roleRoutes: Record<string, string> = {
      teacher: '/teacher/dashboard',
      admin:   '/admin/dashboard',
      parent:  '/parent/dashboard',
      student: '/student/dashboard',
    };
    const role = this.currentUser()?.role ?? '';
    this.router.navigate([roleRoutes[role] ?? '/student/dashboard']);
  }

  private async loadUserProfile(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiBaseUrl}/auth/profile`)
      );
      if (response?.success) {
        const user: User = {
          id:          String(response.id),
          firstName:   response.firstName,
          lastName:    response.lastName,
          username:    response.username,
          name:        `${response.firstName} ${response.lastName}`,
          email:       response.email,
          role:        response.role as Role,
          className:   response.className,
          grade:       response.className,
          phoneNumber: response.phoneNumber,
          schoolName:  response.schoolName,
          studentId:   response.studentId ?? undefined,
        };
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (e) {
      console.error('Failed to load user profile from backend', e);
    }
  }
}
