import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TeacherPortalService } from './shared/services/teacher-portal.service';
import { TeacherNotificationWsService, TeacherNotificationPush } from '../../core/inbox/teacher-notification-ws.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-teacher-portal',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './teacher-portal.component.html'
})
export class TeacherPortalComponent implements OnInit, OnDestroy {
  readonly portalService = inject(TeacherPortalService);
  private notifWs = inject(TeacherNotificationWsService);

  notifToast = signal<string | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;
  private notifSub?: Subscription;

  ngOnInit(): void {
    this.portalService.loadMyClasses().subscribe();
    this.portalService.loadMe().subscribe(r => this.notifWs.connect(r.teacherId));
    this.notifSub = this.notifWs.notification$.subscribe(n => this.showToast(n));
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
    clearTimeout(this.toastTimer);
  }

  private showToast(n: TeacherNotificationPush): void {
    this.notifToast.set(n.message);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.notifToast.set(null), 4000);
  }
}
