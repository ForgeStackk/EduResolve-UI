import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private router      = inject(Router);
  private authService = inject(AuthService);

  loading      = signal(false);
  errorMessage = signal('');
  identifier   = '';
  password     = '';

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.redirectToDashboard();
    }
  }

  login(): void {
    if (!this.identifier || !this.password || this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.authService.loginWithCredentials(this.identifier, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.authService.redirectToDashboard();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Invalid credentials.');
      },
    });
  }

  goToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }
}
