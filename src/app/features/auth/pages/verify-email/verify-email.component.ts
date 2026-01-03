import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner.component';
import { VerifyCodeDto, ResendCodeDto } from '../../../../shared/models/auth.model';
import { CustomValidators } from '../../../../shared/validators';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  protected email = '';
  protected shortToken = '';
  protected isLoading = signal(false);
  protected errorMessage = signal('');
  protected successMessage = signal('');
  protected canResend = signal(true);
  protected countdown = signal(0);

  protected readonly verifyForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, CustomValidators.verificationCode()]]
  });

  get code() { return this.verifyForm.get('code'); }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.email = sessionStorage.getItem('verificationEmail') || '';
    this.shortToken = sessionStorage.getItem('shortToken') || '';

    if (!this.email || !this.shortToken) {
      this.router.navigate(['/auth/register']);
    }
  }

  protected onSubmit(): void {
    if (this.verifyForm.invalid) {
      this.code?.markAsTouched();
      return;
    }

    this.performVerification();
  }

  private performVerification(): void {
    this.isLoading.set(true);
    this.clearMessages();

    const verifyData: VerifyCodeDto = {
      shortToken: this.shortToken,
      email: this.email,
      code: this.verifyForm.value.code
    };

    this.authService.verifyCode(verifyData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => this.handleVerificationSuccess(user),
        error: (error) => this.handleVerificationError(error)
      });
  }

  private handleVerificationSuccess(user: any): void {
    this.isLoading.set(false);
    
    this.clearSessionData();
    
    // Check businessId and navigate accordingly
    if (!user.businessId) {
      this.successMessage.set('Email verified successfully! Setting up your business...');
      setTimeout(() => {
        this.router.navigate(['/business/setup']);
      }, 2000);
    } else {
      this.successMessage.set('Email verified successfully! Redirecting to dashboard...');
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    }
  }

  private handleVerificationError(error: any): void {
    this.isLoading.set(false);
    
    let errorMessage = 'Verification failed. Please check your code.';
    
    if (error?.error?.message && Array.isArray(error.error.message)) {
      errorMessage = error.error.message[0];
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    this.errorMessage.set(errorMessage);
  }

  protected resendCode(): void {
    if (!this.canResend() || this.isLoading()) return;

    this.isLoading.set(true);
    this.clearMessages();

    const resendData: ResendCodeDto = { id: this.shortToken };

    this.authService.resendCode(resendData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => this.handleResendSuccess(response),
        error: (error) => this.handleResendError(error)
      });
  }

  private handleResendSuccess(response: any): void {
    this.isLoading.set(false);
    
    if (response.shortToken) {
      this.shortToken = response.shortToken;
      sessionStorage.setItem('shortToken', response.shortToken);
    }
    
    this.successMessage.set('Verification code sent successfully!');
    this.startResendCountdown();
    
    setTimeout(() => {
      this.successMessage.set('');
    }, 3000);
  }

  private handleResendError(error: any): void {
    this.isLoading.set(false);
    
    let errorMessage = 'Failed to resend code. Please try again.';
    
    if (error?.error?.message && Array.isArray(error.error.message)) {
      errorMessage = error.error.message[0];
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    this.errorMessage.set(errorMessage);
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

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private clearSessionData(): void {
    sessionStorage.removeItem('shortToken');
    sessionStorage.removeItem('verificationEmail');
  }
}