import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';

interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  className: string;
  email: string;
  password: string;
  role: string;
  phoneNumber: string;
  schoolName: string;
  studentId?: string;
}

interface StudentOption {
  studentId: string;
  fullName: string;
  rollNumber: string;
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
  token?: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  firstName = '';
  lastName = '';
  username = '';
  className = '';
  email = '';
  password = '';
  confirmPassword = '';
  phoneNumber = '';
  schoolName = '';
  customSchoolName = '';
  role = 'student';
  loading = signal(false);
  errorMessage = signal('');
  schools = signal<string[]>([]);
  showCustomSchoolInput = signal(false);
  usernameSuggestions = signal<string[]>([]);
  
  // Teacher: class-teacher grade ("9"|"10"|"11"|"12"|"") and section ("A"-"E"|"")
  classTeacherGrade = '';
  classTeacherSection = '';

  // Student section
  section = '';

  // Parent: child's class selector + section + student list
  parentClass = '';
  parentSection = '';
  parentStudentId = '';
  parentStudents = signal<StudentOption[]>([]);
  parentStudentsLoading = signal(false);

  // Fields visibility based on role
  showClassName        = signal(true);   // student class
  showClassTeacherSelect = signal(false); // teacher CT grade
  showParentStudentFields = signal(false); // parent child selector
  showSchoolName = signal(true);

  constructor() {
    this.loadSchools();
  }

  generateUsernameSuggestions() {
    if (this.firstName && this.lastName) {
      const baseName = (this.firstName.toLowerCase() + this.lastName.toLowerCase()).replace(/\s/g, '');
      const suggestions: string[] = [];
      
      // Generate 3 suggestions with random numbers
      for (let i = 0; i < 3; i++) {
        const randomNum = Math.floor(Math.random() * 1000);
        suggestions.push(baseName + randomNum);
      }
      
      this.usernameSuggestions.set(suggestions);
    } else {
      this.usernameSuggestions.set([]);
    }
  }

  onFirstNameChange() {
    this.generateUsernameSuggestions();
  }

  onLastNameChange() {
    this.generateUsernameSuggestions();
  }

  selectSuggestion(suggestion: string) {
    this.username = suggestion;
  }

  loadSchools() {
    this.http.get<string[]>(`${environment.apiBaseUrl}/schools`).subscribe({
      next: (schools) => {
        this.schools.set(schools);
      },
      error: (error) => {
        console.error('Failed to load schools:', error);
        // Fallback schools if API fails
        this.schools.set([
          'Delhi Public School, Lucknow',
          'City Montessori School, Lucknow',
          'La Martiniere College, Lucknow',
          'St. Francis\' College, Lucknow',
          'Loreto Convent, Lucknow'
        ]);
      }
    });
  }

  signup() {
    if (!this.firstName || !this.lastName || !this.username || !this.email ||
        !this.password || !this.phoneNumber) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    // Check class name for students
    if (this.showClassName() && !this.className) {
      this.errorMessage.set('Please select your class');
      return;
    }

    // Check parent child selection
    if (this.showParentStudentFields()) {
      if (!this.parentClass) {
        this.errorMessage.set('Please select your child\'s class');
        return;
      }
      if (!this.parentStudentId) {
        this.errorMessage.set('Please select your child\'s name');
        return;
      }
    }

    // Check school selection (required for all roles)
    if (!this.showCustomSchoolInput() && !this.schoolName) {
      this.errorMessage.set('Please select a school');
      return;
    }

    if (this.showCustomSchoolInput() && !this.customSchoolName) {
      this.errorMessage.set('Please enter your school name');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const finalSchoolName = this.showCustomSchoolInput() ? this.customSchoolName : this.schoolName;

    const sectionSuffix = (this.section && this.section !== 'none') ? this.section : '';
    const ctSectionSuffix = (this.classTeacherSection && this.classTeacherSection !== 'none') ? this.classTeacherSection : '';
    const parentSectionSuffix = (this.parentSection && this.parentSection !== 'none') ? this.parentSection : '';
    const resolvedClassName = this.role === 'teacher'
      ? (this.classTeacherGrade + ctSectionSuffix)
      : this.role === 'parent'
      ? (this.parentClass + parentSectionSuffix)
      : (this.showClassName() ? (this.className + sectionSuffix) : '');

    const request: RegisterRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      className: resolvedClassName,
      email: this.email,
      password: this.password,
      role: this.role,
      phoneNumber: this.phoneNumber,
      schoolName: finalSchoolName,
      ...(this.parentStudentId ? { studentId: this.parentStudentId } : {})
    };

    this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/register`, request).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          if (response.token) {
            localStorage.setItem('access_token', response.token);
          }
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
          this.errorMessage.set(response.message || 'Registration failed. Please try again.');
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        if (error.status === 409) {
          this.errorMessage.set('This email or username is already registered. Please login instead.');
        } else if (error.status === 400) {
          this.errorMessage.set('Invalid information provided. Please check your inputs.');
        } else if (error.status === 500) {
          this.errorMessage.set('Server error. Please try again later.');
        } else {
          this.errorMessage.set('Registration failed. Please try again.');
        }
        this.loading.set(false);
      }
    });
  }

  onSchoolChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select.value === 'other') {
      this.showCustomSchoolInput.set(true);
      this.schoolName = '';
    } else {
      this.showCustomSchoolInput.set(false);
      this.schoolName = select.value;
      this.customSchoolName = '';
    }
  }

  onRoleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.role = select.value;

    this.showClassName.set(this.role === 'student');
    this.showClassTeacherSelect.set(this.role === 'teacher');
    this.showParentStudentFields.set(this.role === 'parent');
    this.showSchoolName.set(true);

    // Reset role-specific fields
    this.className = '';
    this.section = '';
    this.classTeacherGrade = '';
    this.classTeacherSection = '';
    this.parentClass = '';
    this.parentSection = '';
    this.parentStudentId = '';
    this.parentStudents.set([]);
  }

  onClassTeacherGradeChange(): void {
    this.classTeacherSection = '';
  }

  onParentClassChange(): void {
    this.parentSection = '';
    this.parentStudentId = '';
    this.parentStudents.set([]);
  }

  onParentSectionChange(): void {
    this.parentStudentId = '';
    this.parentStudents.set([]);
    if (!this.parentClass || !this.parentSection) return;

    this.parentStudentsLoading.set(true);
    const sectionParam = (this.parentSection && this.parentSection !== 'none')
      ? `?section=${this.parentSection}` : '';
    this.http
      .get<StudentOption[]>(`${environment.apiBaseUrl}/auth/students-by-grade/${this.parentClass}${sectionParam}`)
      .subscribe({
        next: list => { this.parentStudents.set(list); this.parentStudentsLoading.set(false); },
        error: ()   => { this.parentStudentsLoading.set(false); }
      });
  }

  private redirectBasedOnRole(role: string): void {
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

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
