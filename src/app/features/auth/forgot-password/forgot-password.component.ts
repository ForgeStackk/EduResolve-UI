import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  token?: string;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  email = signal('');
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  resetToken = signal('');

  onSubmit(): void {
    if (!this.email()) {
      this.errorMessage.set('Please enter your email address');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request: ForgotPasswordRequest = {
      email: this.email()
    };

    this.http.post<ForgotPasswordResponse>(`${environment.apiBaseUrl}/auth/forgot-password`, request).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.successMessage.set(response.message);
          if (response.token) {
            this.resetToken.set(response.token);
          }
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set('Failed to process request. Please try again.');
        console.error('Forgot password error:', error);
      }
    });
  }

  goToResetPassword(): void {
    if (this.resetToken()) {
      this.router.navigate(['/auth/reset-password'], {
        queryParams: {
          email: this.email(),
          token: this.resetToken()
        }
      });
    } else {
      this.router.navigate(['/auth/reset-password'], {
        queryParams: {
          email: this.email()
        }
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
