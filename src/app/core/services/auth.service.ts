import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, throwError } from 'rxjs';
import {
  LoginDto,
  EmailOtpDto,
  VerifyCodeDto,
  AppleSignInDto,
  AuthResponse,
  User,
  withId,
  API_ENDPOINTS,
} from '../../shared';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokens = inject(TokenStorageService);

  // Public readonly signals
  readonly user = signal<User | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.initializeAuth();
  }

  // Rehydrate from the stored session (access token + cached user).
  private initializeAuth(): void {
    const user = this.tokens.getUser();
    if (user && this.tokens.hasSession()) {
      this.setAuthState(user, true);
    }
  }

  /** Email + password sign-in. */
  login(credentials: LoginDto): Observable<User> {
    this.clearError();
    this.setLoading(true);
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGN_IN_PASSWORD, credentials).pipe(
      map((res) => this.handleAuthSuccess(res)),
      catchError((error) => this.fail(error, 'Sign-in failed. Check your email and password.')),
    );
  }

  /** Step 1 of passwordless sign-in: request a one-time code by email. */
  requestEmailCode(data: EmailOtpDto): Observable<{ message?: string }> {
    this.clearError();
    this.setLoading(true);
    return this.http.post<{ message?: string }>(API_ENDPOINTS.AUTH.SIGN_IN_EMAIL, data).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => this.fail(error, 'Could not send the code. Please try again.')),
    );
  }

  /** Step 2 of passwordless sign-in: verify the emailed code. */
  verifyCode(data: VerifyCodeDto): Observable<User> {
    this.clearError();
    this.setLoading(true);
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.VERIFY_CODE, data).pipe(
      map((res) => this.handleAuthSuccess(res)),
      catchError((error) => this.fail(error, 'Verification failed. Please check your code.')),
    );
  }

  /** Google sign-in with an ID token obtained from Google Identity Services. */
  signInWithGoogle(idToken: string): Observable<User> {
    this.clearError();
    this.setLoading(true);
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGN_IN_GOOGLE, { idToken }).pipe(
      map((res) => this.handleAuthSuccess(res)),
      catchError((error) => this.fail(error, 'Google sign-in failed. Please try again.')),
    );
  }

  /** Apple sign-in (web flow). */
  signInWithApple(data: AppleSignInDto): Observable<User> {
    this.clearError();
    this.setLoading(true);
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGN_IN_APPLE, data).pipe(
      map((res) => this.handleAuthSuccess(res)),
      catchError((error) => this.fail(error, 'Apple sign-in failed. Please try again.')),
    );
  }

  /** Logout is local-only — clear the session and return to the login screen. */
  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  forceLogout(): void {
    this.logout();
  }

  // Persist tokens + user, flip auth state, and route into the app.
  private handleAuthSuccess(res: AuthResponse): User {
    const user = withId(res.user) as User;
    this.tokens.setTokens(res.accessToken, res.refreshToken);
    this.tokens.setUser(user);
    this.setLoading(false);
    this.setAuthState(user, true);
    this.routeAfterAuth(user);
    return user;
  }

  /** No business yet → onboarding; otherwise the dashboard. */
  private routeAfterAuth(user: User): void {
    if (!user.businessId) {
      this.router.navigate(['/business/setup']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private fail(error: unknown, message: string): Observable<never> {
    this.setLoading(false);
    this.error.set(message);
    return throwError(() => error);
  }

  private setAuthState(user: User, isAuthenticated: boolean): void {
    this.user.set(user);
    this.isAuthenticated.set(isAuthenticated);
  }

  private clearAuthState(): void {
    this.tokens.clear();
    this.user.set(null);
    this.isAuthenticated.set(false);
    this.error.set(null);
  }

  private setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  private clearError(): void {
    this.error.set(null);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated() || this.tokens.hasSession();
  }

  getCurrentUser(): User | null {
    return this.user() ?? this.tokens.getUser();
  }

  /** Refresh the cached user after a profile/business change. */
  updateCachedUser(patch: Partial<User>): void {
    const current = this.getCurrentUser();
    if (!current) return;
    const next = { ...current, ...patch } as User;
    this.tokens.setUser(next);
    this.user.set(next);
  }
}
