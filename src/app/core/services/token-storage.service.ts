import { Injectable } from '@angular/core';
import { User } from '../../shared/models/user.model';

/**
 * Persists the auth session in localStorage. The new backend uses Bearer
 * access/refresh tokens (not httpOnly cookies), so the access token is attached
 * to every request by the api interceptor and refreshed on 401.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private static readonly ACCESS = 'accessToken';
  private static readonly REFRESH = 'refreshToken';
  private static readonly USER = 'user';

  get accessToken(): string | null {
    return localStorage.getItem(TokenStorageService.ACCESS);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(TokenStorageService.REFRESH);
  }

  setTokens(accessToken: string, refreshToken?: string | null): void {
    localStorage.setItem(TokenStorageService.ACCESS, accessToken);
    if (refreshToken) {
      localStorage.setItem(TokenStorageService.REFRESH, refreshToken);
    }
  }

  getUser(): User | null {
    const raw = localStorage.getItem(TokenStorageService.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  setUser(user: User): void {
    localStorage.setItem(TokenStorageService.USER, JSON.stringify(user));
  }

  hasSession(): boolean {
    return !!this.accessToken;
  }

  clear(): void {
    localStorage.removeItem(TokenStorageService.ACCESS);
    localStorage.removeItem(TokenStorageService.REFRESH);
    localStorage.removeItem(TokenStorageService.USER);
  }
}
