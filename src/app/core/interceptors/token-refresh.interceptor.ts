import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../shared/api.constants';
import { TokenStorageService } from '../services/token-storage.service';

interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

// Shared state so concurrent 401s wait for a single in-flight refresh.
let isRefreshing = false;
const newTokenSubject = new BehaviorSubject<string | null>(null);

// Auth endpoints must never trigger a refresh (they ARE the auth flow).
function isAuthUrl(url: string): boolean {
  return url.includes('/auth/');
}

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const tokens = inject(TokenStorageService);

  const retryWithToken = (accessToken: string) =>
    next(req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }));

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthUrl(req.url)) {
        return throwError(() => error);
      }

      const refreshToken = tokens.refreshToken;
      if (!refreshToken) {
        tokens.clear();
        router.navigate(['/auth/login']);
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        newTokenSubject.next(null);

        const refreshUrl = `${environment.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`;
        return http
          .post<RefreshResponse>(
            refreshUrl,
            { refreshToken },
            { headers: { Authorization: `Bearer ${refreshToken}` } },
          )
          .pipe(
            switchMap((res) => {
              isRefreshing = false;
              tokens.setTokens(res.accessToken, res.refreshToken);
              newTokenSubject.next(res.accessToken);
              return retryWithToken(res.accessToken);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              newTokenSubject.next(null);
              tokens.clear();
              router.navigate(['/auth/login']);
              return throwError(() => refreshError);
            }),
          ) as Observable<any>;
      }

      // A refresh is already in flight — wait for the new token, then retry.
      return newTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => retryWithToken(token as string)),
      );
    }),
  );
};
