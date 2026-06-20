import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './services/token-storage.service';

/**
 * Prepends the API base URL and attaches the Bearer access token. The new
 * backend authenticates with a JWT access token (not httpOnly cookies), so we
 * no longer send credentials/cookies.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip if URL is already absolute
  if (req.url.startsWith('http')) {
    return next(req);
  }

  const tokens = inject(TokenStorageService);
  const accessToken = tokens.accessToken;

  const headers: Record<string, string> = {};
  if (!(req.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const apiReq = req.clone({
    url: `${environment.apiUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`,
    setHeaders: headers,
  });

  return next(apiReq);
};