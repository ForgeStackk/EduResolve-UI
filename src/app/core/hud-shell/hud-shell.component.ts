import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageToggleComponent } from '../i18n/language-toggle/language-toggle.component';
import { AuthService, MOCK_STUDENT_PROFILE } from '../auth/auth.service';
import { StudentApiService, StudentProfile } from '../api/student-api.service';
import { InboxWebSocketService } from '../inbox/inbox-websocket.service';
import { ClassroomWsService } from '../../features/student/classroom/classroom-ws.service';

export type HudRole = 'student' | 'teacher' | 'admin' | 'parent';

export interface HudNavItem {
  icon: string;
  labelKey: string;
  link: string;
  exact?: boolean;
  comingSoon?: boolean;
}

interface HudRoleTheme {
  brand: string;
  homeLink: string;
  nav: HudNavItem[];
}

const HUD_ROLE_THEMES: Record<HudRole, HudRoleTheme> = {
  student: {
    brand: 'ACADEMY_HUD',
    homeLink: '/student/dashboard',
    nav: [
      { icon: 'home',          labelKey: 'nav.home',     link: '/student/dashboard', exact: true },
      { icon: 'inbox',         labelKey: 'nav.inbox',    link: '/student/inbox' },
      { icon: 'local_library', labelKey: 'nav.subjects', link: '/learn/subjects' },
      { icon: 'edit_note',     labelKey: 'nav.notes',     link: '/student/notes' },
      { icon: 'groups',        labelKey: 'nav.classroom', link: '/student/classroom' },
      { icon: 'forum',         labelKey: 'nav.doubts',   link: '/student/doubts' },
      { icon: 'psychology_alt',labelKey: 'nav.ai',       link: '/learn/doubt' }
    ]
  },
  teacher: {
    brand: 'TEACHER_SUITE',
    homeLink: '/teacher/dashboard',
    nav: [
      { icon: 'dashboard',      labelKey: 'nav.overview',    link: '/teacher/dashboard' },
      { icon: 'groups',         labelKey: 'nav.classes',     link: '/teacher/classes' },
      { icon: 'assignment',     labelKey: 'nav.assignments', link: '/teacher/assignments' }
    ]
  },
  admin: {
    brand: 'ADMIN_CONSOLE',
    homeLink: '/admin/dashboard',
    nav: [
      { icon: 'insights',        labelKey: 'nav.overview', link: '/admin/dashboard' },
      { icon: 'manage_accounts', labelKey: 'nav.users',    link: '/admin/users' }
    ]
  },
  parent: {
    brand: 'FAMILY_HUB',
    homeLink: '/parent/dashboard',
    nav: [
      { icon: 'home', labelKey: 'nav.overview', link: '/parent/dashboard' }
    ]
  }
};

/** Root-level paths that never show the back button. */
const ROOT_PATHS = new Set([
  '/student/dashboard',
  '/student/inbox',
  '/student/notes',
  '/student/classroom',
  '/student/doubts',
  '/learn/subjects',
  '/learn/quiz',
  '/learn/doubt',
  '/learn/bookmarks',
  '/teacher/dashboard',
  '/teacher/classes',
  '/teacher/assignments',
  '/admin/dashboard',
  '/parent/dashboard',
]);

@Component({
  selector: 'app-hud-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LanguageToggleComponent, TranslateModule],
  templateUrl: './hud-shell.component.html',
  styleUrl: './hud-shell.component.css'
})
export class HudShellComponent implements OnInit {
  private studentApi   = inject(StudentApiService);
  private auth         = inject(AuthService);
  private location     = inject(Location);
  private ws           = inject(InboxWebSocketService);
  private classroomWs  = inject(ClassroomWsService);
  protected router     = inject(Router);

  role       = signal<HudRole>(this.roleFromUrl(this.router.url));
  currentUrl = signal<string>(this.router.url.split('?')[0]);

  /** Unread inbox badge — shown on the Inbox nav item. */
  inboxBadge     = computed(() => this.ws.unreadCount());
  classroomBadge = computed(() => this.classroomWs.unreadCount());

  theme = computed(() => HUD_ROLE_THEMES[this.role()]);

  /** Show back button on any screen that is not a root-level destination. */
  showBackBtn = computed(() => !ROOT_PATHS.has(this.currentUrl()));

  profile = signal<StudentProfile | null>(MOCK_STUDENT_PROFILE as unknown as StudentProfile);

  initials = computed(() => {
    const p = this.profile();
    if (p?.initials) return p.initials;
    const name = p?.name ?? this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  });
  streak     = computed(() => this.profile()?.streakDays ?? 0);
  schoolName = computed(() => this.auth.currentUser()?.schoolName ?? '');

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe(e => {
      const nav = e as NavigationEnd;
      const path = nav.urlAfterRedirects.split('?')[0];
      this.role.set(this.roleFromUrl(path));
      this.currentUrl.set(path);
      if (path === '/student/inbox') this.ws.clearBadge();
    });
  }

  ngOnInit(): void {
    if (this.role() !== 'student') return;
    const id = this.auth.currentStudentId();
    if (id == null) return;
    this.studentApi.getById(id).subscribe({
      next: me => this.profile.set(me),
      error: () => { /* keep MOCK_STUDENT_PROFILE */ }
    });
  }

  goBack(): void {
    this.location.back();
  }

  logout(): void {
    this.auth.logout();
  }

  private roleFromUrl(url: string): HudRole {
    const path = (url || '/').split('?')[0];
    if (path.startsWith('/teacher')) return 'teacher';
    if (path.startsWith('/admin'))   return 'admin';
    if (path.startsWith('/parent'))  return 'parent';
    return 'student';
  }
}
