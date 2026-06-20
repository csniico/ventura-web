import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner.component';
import { VerifyCodeDto } from '../../../../shared/models/auth.model';
import { CustomValidators } from '../../../../shared/validators';

/**
 * Step 2 of passwordless sign-in: verify the one-time code emailed to the user.
 * The email arrives as a query param from the login screen.
 */
@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  protected email = '';
  protected isLoading = signal(false);
  protected errorMessage = signal('');
  protected successMessage = signal('');
  protected canResend = signal(true);
  protected countdown = signal(0);

  protected readonly verifyForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, CustomValidators.verificationCode()]],
  });

  get code() {
    return this.verifyForm.get('code');
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    if (!this.email) {
      this.router.navigate(['/auth/login']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSubmit(): void {
    if (this.verifyForm.invalid) {
      this.code?.markAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.clearMessages();

    const data: VerifyCodeDto = { email: this.email, code: this.verifyForm.value.code };
    this.authService
      .verifyCode(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Navigation (onboarding vs dashboard) is handled by AuthService.
          this.isLoading.set(false);
          this.successMessage.set('Signed in! Redirecting…');
        },
        error: (error) => this.handleError(error, 'Verification failed. Please check your code.'),
      });
  }

  protected resendCode(): void {
    if (!this.canResend() || this.isLoading()) return;
    this.isLoading.set(true);
    this.clearMessages();
    this.authService
      .requestEmailCode({ email: this.email })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('A new code has been sent.');
          this.startResendCountdown();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => this.handleError(error, 'Failed to resend code. Please try again.'),
      });
  }

  private startResendCountdown(): void {
    this.canResend.set(false);
    this.countdown.set(60);
    const timer = setInterval(() => {
      const current = this.countdown() - 1;
      this.countdown.set(current);
      if (current <= 0) {
        this.canResend.set(true);
        clearInterval(timer);
      }
    }, 1000);
  }

  private handleError(error: any, fallback: string): void {
    this.isLoading.set(false);
    let message = fallback;
    if (error?.error?.message) {
      message = Array.isArray(error.error.message) ? error.error.message[0] : error.error.message;
    }
    this.errorMessage.set(message);
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
