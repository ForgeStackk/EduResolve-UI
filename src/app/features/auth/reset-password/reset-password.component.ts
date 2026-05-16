import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = signal('');
  token = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    // Get email and token from query params
    this.route.queryParams.subscribe((params: any) => {
      if (params['email']) {
        this.email.set(params['email']);
      }
      if (params['token']) {
        this.token.set(params['token']);
      }
    });
  }

  onSubmit(): void {
    if (!this.email() || !this.token()) {
      this.errorMessage.set('Email and token are required');
      return;
    }

    if (!this.newPassword()) {
      this.errorMessage.set('Please enter a new password');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    if (this.newPassword().length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request: ResetPasswordRequest = {
      email: this.email(),
      token: this.token(),
      newPassword: this.newPassword()
    };

    this.http.post<ResetPasswordResponse>(`${environment.apiBaseUrl}/auth/reset-password`, request).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.successMessage.set(response.message);
          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set('Failed to reset password. Please try again.');
        console.error('Reset password error:', error);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
