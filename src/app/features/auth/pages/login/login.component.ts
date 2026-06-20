import {
  Component,
  inject,
  signal,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleSignInService } from '../../../../core/services/google-signin.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner.component';
import { LoginDto } from '../../../../shared/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly google = inject(GoogleSignInService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('googleBtn') googleBtn?: ElementRef<HTMLElement>;

  // 'password' or 'code' (passwordless email OTP).
  protected mode = signal<'password' | 'code'>('password');
  protected isLoading = signal(false);
  protected errorMessage = signal('');

  protected readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }

  protected setMode(mode: 'password' | 'code'): void {
    this.mode.set(mode);
    this.errorMessage.set('');
    const passwordCtrl = this.loginForm.get('password');
    if (mode === 'code') {
      passwordCtrl?.clearValidators();
    } else {
      passwordCtrl?.setValidators([Validators.required]);
    }
    passwordCtrl?.updateValueAndValidity();
  }

  protected onSubmit(): void {
    if (this.mode() === 'code') {
      this.requestCode();
      return;
    }
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }
    this.performLogin();
  }

  ngAfterViewInit(): void {
    if (!this.googleBtn) return;
    this.google.renderButton(
      this.googleBtn.nativeElement,
      (idToken) => this.zone.run(() => this.onGoogleToken(idToken)),
      (err) => this.zone.run(() => this.errorMessage.set(err.message)),
    );
  }

  private onGoogleToken(idToken: string): void {
    this.errorMessage.set('');
    this.isLoading.set(true);
    this.authService
      .signInWithGoogle(idToken)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.isLoading.set(false),
        error: (error) => this.handleError(error, 'Google sign-in failed.'),
      });
  }

  private performLogin(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    const credentials: LoginDto = {
      email: this.email?.value,
      password: this.password?.value,
    };
    this.authService
      .login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.isLoading.set(false),
        error: (error) => this.handleError(error, 'Invalid credentials. Please try again.'),
      });
  }

  private requestCode(): void {
    if (this.email?.invalid) {
      this.email?.markAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    const email = this.email?.value as string;
    this.authService
      .requestEmailCode({ email })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/auth/verify-code'], { queryParams: { email } });
        },
        error: (error) => this.handleError(error, 'Could not send the code. Please try again.'),
      });
  }

  private handleError(error: any, fallback: string): void {
    this.isLoading.set(false);
    let message = fallback;
    if (error?.error?.message) {
      message = Array.isArray(error.error.message) ? error.error.message[0] : error.error.message;
    } else if (typeof error?.message === 'string' && !error?.status) {
      message = error.message;
    }
    this.errorMessage.set(message);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
