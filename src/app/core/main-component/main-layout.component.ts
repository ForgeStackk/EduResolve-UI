import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopNavComponent } from '../top-nav-component/top-nav.component';
import { BreadcrumbComponent } from '../breadcrumb-component/breadcrumb.component';
import { HudShellComponent } from '../hud-shell/hud-shell.component';
import { AuthService } from '../auth/auth.service';
import { InboxWebSocketService } from '../inbox/inbox-websocket.service';
import { InboxToastComponent } from '../inbox/inbox-toast.component';

/**
 * Top-level layout. Two modes:
 *  - HUD shell -> /student, /learn, /teacher, /admin, /parent (all role
 *    surfaces share the Academy HUD aesthetic; the shell adapts its brand
 *    and bottom nav to the current role).
 *  - Classic shell -> reserved for auth/legacy routes that don't match any
 *    of the known role prefixes.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    TopNavComponent,
    BreadcrumbComponent,
    HudShellComponent,
    InboxToastComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private inboxWs = inject(InboxWebSocketService);
  isHud = signal(this.computeIsHud(this.router.url));

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe(e => this.isHud.set(this.computeIsHud((e as NavigationEnd).urlAfterRedirects)));
  }

  ngOnInit(): void {
    // Connect inbox WebSocket for student and parent roles.
    // Uses user.id as the recipientId — must match the UUID stored in
    // tp_student.student_id / tp_parent.parent_id for push delivery.
    const user = this.auth.currentUser();
    if (user && (user.role === 'student' || user.role === 'parent')) {
      this.inboxWs.connect(user.id);
    }
  }

  private computeIsHud(url: string): boolean {
    const path = (url || '/').split('?')[0];
    return (
      path === '/' ||
      path.startsWith('/student') ||
      path.startsWith('/learn') ||
      path.startsWith('/teacher') ||
      path.startsWith('/admin') ||
      path.startsWith('/parent')
    );
  }
}