import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../shared/api.constants';

// Shared state for token refresh
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

// URLs that should not trigger token refresh
const EXCLUDED_URLS = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.REFRESH_TOKEN,
  API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
];

function isExcludedUrl(url: string): boolean {
  return EXCLUDED_URLS.some(excluded => url.includes(excluded));
}

function clearAuthAndRedirect(router: Router): void {
  localStorage.removeItem('user');
  router.navigate(['/auth/login']);
}

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 errors for authenticated requests
      if (error.status !== 401 || isExcludedUrl(req.url)) {
        return throwError(() => error);
      }

      // Check if user is supposed to be authenticated
      const userData = localStorage.getItem('user');
      if (!userData) {
        // User is not logged in, just redirect
        router.navigate(['/auth/login']);
        return throwError(() => error);
      }

      // Handle token refresh
      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        const refreshUrl = `${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`;

        return http.post(refreshUrl, {}, { withCredentials: true }).pipe(
          switchMap(() => {
            isRefreshing = false;
            refreshTokenSubject.next(true);
            // Retry the original request
            return next(req);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            refreshTokenSubject.next(false);
            // Refresh failed - clear auth and redirect to login
            clearAuthAndRedirect(router);
            return throwError(() => refreshError);
          }),
          finalize(() => {
            isRefreshing = false;
          })
        );
      } else {
        // Wait for the ongoing refresh to complete
        return refreshTokenSubject.pipe(
          filter(result => result !== null),
          take(1),
          switchMap(success => {
            if (success) {
              // Retry the original request
              return next(req);
            } else {
              // Refresh failed
              return throwError(() => error);
            }
          })
        );
      }
    })
  );
};
