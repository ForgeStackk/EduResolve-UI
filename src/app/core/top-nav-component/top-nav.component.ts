import { Component, computed, inject } from '@angular/core';
import { LanguageToggleComponent } from '../i18n/language-toggle/language-toggle.component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [LanguageToggleComponent],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css'
})
export class TopNavComponent {
  private authService = inject(AuthService);

  schoolName     = computed(() => this.authService.currentUser()?.schoolName ?? '');
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  login(): void  { this.authService.login(); }
  logout(): void { this.authService.logout(); }
}
