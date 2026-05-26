import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, type User } from '../../core/auth/auth.service';
import { AtRiskBadgeService } from '../../features/admin/attendance/at-risk-badge.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  protected authService = inject(AuthService);
  protected badge = inject(AtRiskBadgeService);

  get currentUser(): User | null {
    return this.authService.currentUser() as User | null;
  }

  ngOnInit(): void {
    if (this.currentUser?.role === 'admin') {
      this.badge.start();
    }
  }

  ngOnDestroy(): void {
    this.badge.stop();
  }

  logout(): void {
    this.badge.stop();
    this.authService.logout();
  }
}
