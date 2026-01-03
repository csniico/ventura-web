import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip if URL is already absolute
  if (req.url.startsWith('http')) {
    return next(req);
  }

  // Add base URL and credentials
  const apiReq = req.clone({
    url: `${environment.apiUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`,
    setHeaders: req.body instanceof FormData ? {} : {
      'Content-Type': 'application/json',
    },
    withCredentials: true // Enable httpOnly cookies
  });

  return next(apiReq);
};