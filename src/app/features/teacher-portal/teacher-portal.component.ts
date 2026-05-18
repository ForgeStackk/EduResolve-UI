import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { TeacherPortalService } from './shared/services/teacher-portal.service';
import { TeacherNotificationWsService, TeacherNotificationPush } from '../../core/inbox/teacher-notification-ws.service';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  ctOnly: boolean;
}

@Component({
  selector: 'app-teacher-portal',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './teacher-portal.component.html'
})
export class TeacherPortalComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly portalService = inject(TeacherPortalService);
  private router = inject(Router);
  private notifWs = inject(TeacherNotificationWsService);

  isClassTeacher = this.portalService.isClassTeacher;
  currentUrl = signal(this.router.url);
  loading = signal(true);

  /** Live notification badge count from WebSocket. */
  notifCount = this.notifWs.unreadCount;

  /** Toast message from most recent push — auto-clears after 4 s. */
  notifToast = signal<string | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;
  private notifSub?: Subscription;

  readonly navItems: NavItem[] = [
    { label: 'teacher.nav.myClass',   icon: '📋', path: '/teacher/my-class/attendance', ctOnly: true },
    { label: 'teacher.nav.messages',  icon: '📨', path: '/teacher/messages/compose',    ctOnly: false },
    { label: 'teacher.nav.homework',  icon: '📝', path: '/teacher/homework/assign',     ctOnly: false },
    { label: 'teacher.nav.reports',   icon: '📊', path: '/teacher/my-class/reports',    ctOnly: true },
    { label: 'teacher.nav.archive',   icon: '🗄',  path: '/teacher/archive',             ctOnly: false },
  ];

  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.currentUrl.set((e as NavigationEnd).urlAfterRedirects));

    this.portalService.loadMyClasses().subscribe({
      complete: () => this.loading.set(false),
      error:    () => this.loading.set(false)
    });

    // Once classes load, fetch teacherPortalId and start WebSocket
    this.portalService.loadMe().subscribe(r => {
      this.notifWs.connect(r.teacherId);
    });

    this.notifSub = this.notifWs.notification$.subscribe(n => this.showToast(n));
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
    clearTimeout(this.toastTimer);
  }

  isActive(path: string): boolean {
    return this.currentUrl().startsWith(path.split('?')[0]);
  }

  clearNotifBadge(): void {
    this.notifWs.clearBadge();
  }

  visibleNav = computed(() =>
    this.navItems.filter(item => !item.ctOnly || this.isClassTeacher())
  );

  private showToast(n: TeacherNotificationPush): void {
    this.notifToast.set(n.message);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.notifToast.set(null), 4000);
  }
}
