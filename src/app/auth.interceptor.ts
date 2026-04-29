import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // `localStorage` only exists in the browser; skip on the SSR server pass.
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  if (!isBrowser) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');
  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }

  return next(req);
};