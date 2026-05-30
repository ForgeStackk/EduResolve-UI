import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return next(req);
  }

  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const token = localStorage.getItem('edu_token') ?? inject(OAuthService).getAccessToken();
  const headers: Record<string, string> = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const authReq = req.clone({ setHeaders: headers });

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        localStorage.removeItem('edu_token');
        localStorage.removeItem('user');
        inject(Router).navigate(['/auth/login']);
      }
      return throwError(() => err);
    })
  );
};
