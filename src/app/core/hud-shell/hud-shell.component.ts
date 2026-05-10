import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { LanguageToggleComponent } from '../i18n/language-toggle/language-toggle.component';
import { AuthService, MOCK_STUDENT_PROFILE } from '../auth/auth.service';
import { StudentApiService, StudentProfile } from '../api/student-api.service';

export type HudRole = 'student' | 'teacher' | 'admin' | 'parent';

export interface HudNavItem {
  icon: string;            // Material Symbols outlined name
  label: string;           // aria-label / tooltip
  link: string;            // absolute router link
  exact?: boolean;         // use exact routerLinkActive matching
}

interface HudRoleTheme {
  brand: string;           // top-bar brand text
  homeLink: string;        // where the brand click lands
  nav: HudNavItem[];       // bottom-nav items (max 5)
}

/**
 * Role-aware theme metadata. The HUD visual language is identical across
 * roles; only the brand wordmark and bottom-nav targets change.
 */
const HUD_ROLE_THEMES: Record<HudRole, HudRoleTheme> = {
  student: {
    brand: 'ACADEMY_HUD',
    homeLink: '/student/dashboard',
    nav: [
      { icon: 'home',           label: 'Home',    link: '/student/dashboard' },
      { icon: 'local_library',  label: 'Library', link: '/learn/subjects' },
      { icon: 'quiz',           label: 'Quiz',    link: '/learn/quiz' },
      { icon: 'forum',          label: 'Forum',   link: '/learn/doubt' },
      { icon: 'bookmark',       label: 'Saved',   link: '/learn/bookmarks' }
    ]
  },
  teacher: {
    brand: 'TEACHER_SUeITE',
    homeLink: '/teacher/dashboard',
    nav: [
      { icon: 'dashboard',      label: 'Overview',    link: '/teacher/dashboard' },
      { icon: 'groups',         label: 'Classes',     link: '/teacher/classes' },
      { icon: 'assignment',     label: 'Assignments', link: '/teacher/assignments' }
    ]
  },
  admin: {
    brand: 'ADMIN_CONSOLE',
    homeLink: '/admin/dashboard',
    nav: [
      { icon: 'insights',       label: 'Overview', link: '/admin/dashboard' },
      { icon: 'manage_accounts',label: 'Users',    link: '/admin/users' }
    ]
  },
  parent: {
    brand: 'FAMILY_HUB',
    homeLink: '/parent/dashboard',
    nav: [
      { icon: 'home',           label: 'Overview', link: '/parent/dashboard' }
    ]
  }
};

/**
 * High-Energy HUD shell. Provides:
 *   - Fixed top app bar (role-aware brand + avatar + language toggle + streak)
 *   - Ambient red radial glow background
 *   - Fixed bottom navigation (role-aware targets)
 *   - <router-outlet> for the routed feature view
 *
 * Used by `/student/**`, `/learn/**`, `/teacher/**`, `/admin/**` and
 * `/parent/**` routes via MainLayoutComponent.
 */
@Component({
  selector: 'app-hud-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LanguageToggleComponent],
  templateUrl: './hud-shell.component.html',
  styleUrl: './hud-shell.component.css'
})
export class HudShellComponent implements OnInit {
  private studentApi = inject(StudentApiService);
  private auth = inject(AuthService);
  protected router = inject(Router);

  /** Active role, derived from the current URL. */
  role = signal<HudRole>(this.roleFromUrl(this.router.url));

  theme = computed(() => HUD_ROLE_THEMES[this.role()]);

  /**
   * Student profile (only meaningful when `role() === 'student'`). Seeded
   * from the mock so the header renders even before the API responds.
   */
  profile = signal<StudentProfile | null>(MOCK_STUDENT_PROFILE as unknown as StudentProfile);

  initials = computed(() => {
    const p = this.profile();
    if (p?.initials) return p.initials;
    const name = p?.name ?? this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  });
  streak = computed(() => this.profile()?.streakDays ?? 0);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe(e => this.role.set(this.roleFromUrl((e as NavigationEnd).urlAfterRedirects)));
  }

  ngOnInit(): void {
    // Only the student HUD needs profile data; skip the API call otherwise.
    if (this.role() !== 'student') return;
    const id = this.auth.currentStudentId();
    if (id == null) return;
    this.studentApi.getById(id).subscribe({
      next: me => this.profile.set(me),
      error: () => { /* keep MOCK_STUDENT_PROFILE */ }
    });
  }

  private roleFromUrl(url: string): HudRole {
    const path = (url || '/').split('?')[0];
    if (path.startsWith('/teacher')) return 'teacher';
    if (path.startsWith('/admin'))   return 'admin';
    if (path.startsWith('/parent'))  return 'parent';
    return 'student';
  }
}
