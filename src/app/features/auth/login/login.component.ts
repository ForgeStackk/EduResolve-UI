import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private router      = inject(Router);
  private authService = inject(AuthService);

  loading      = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.redirectToDashboard();
    }
  }

  login(): void {
    this.loading.set(true);
    this.authService.login();
  }

  goToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }
}
