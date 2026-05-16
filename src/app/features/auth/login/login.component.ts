import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  className: string;
  phoneNumber: string;
  schoolName: string;
  message: string;
  success: boolean;
  studentId?: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  username = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  login() {
    if (!this.username || !this.password) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const request: LoginRequest = {
      username: this.username,
      password: this.password
    };

    this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, request).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          // Store user data in localStorage
          const user = {
            id: response.id.toString(),
            firstName: response.firstName,
            lastName: response.lastName,
            username: response.username,
            name: response.firstName + ' ' + response.lastName,
            email: response.email,
            role: response.role,
            className: response.className,
            phoneNumber: response.phoneNumber,
            schoolName: response.schoolName,
            studentId: response.studentId,
            grade: response.className
          };
          this.authService.login(user as any);
          this.redirectBasedOnRole(response.role);
        } else {
          this.errorMessage.set(response.message || 'Login failed. Please try again.');
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        if (error.status === 401) {
          this.errorMessage.set('Invalid username or password');
        } else if (error.status === 404) {
          this.errorMessage.set('Username not found. Please register first.');
        } else if (error.status === 500) {
          this.errorMessage.set('Server error. Please try again later.');
        } else {
          this.errorMessage.set('Login failed. Please try again.');
        }
        this.loading.set(false);
      }
    });
  }

  private redirectBasedOnRole(role: string) {
    switch ((role ?? '').toLowerCase()) {
      case 'teacher':
        this.router.navigate(['/teacher/dashboard']);
        break;
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'parent':
        this.router.navigate(['/parent/dashboard']);
        break;
      default:
        this.router.navigate(['/student/dashboard']);
    }
  }

  goToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }
}
