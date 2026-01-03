import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner.component';
import { ResetPasswordDto, VerifyCodeDto } from '../../../../shared/models/auth.model';
import { CustomValidators } from '../../../../shared/validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  private email = '';
  protected isLoading = signal(false);
  protected errorMessage = signal('');
  protected successMessage = signal('');

  private passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    if (confirmPassword.errors?.['mismatch']) {
      delete confirmPassword.errors['mismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  };

  protected readonly resetForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, CustomValidators.verificationCode()]],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), CustomValidators.strongPassword()]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // Form control getters
  get code() { return this.resetForm.get('code'); }
  get newPassword() { return this.resetForm.get('newPassword'); }
  get confirmPassword() { return this.resetForm.get('confirmPassword'); }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.email = sessionStorage.getItem('resetEmail') || '';
    if (!this.email) {
      this.router.navigate(['/auth/forgot-password']);
      return;
    }
  }

  protected onSubmit(): void {
    if (this.resetForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.resetPassword();
  }

  private resetPassword(): void {
    this.isLoading.set(true);
    this.clearMessages();

    // First verify the code to get the userId
    const verifyData: VerifyCodeDto = {
      shortToken: sessionStorage.getItem('resetToken') || '',
      email: this.email,
      code: this.resetForm.value.code
    };

    this.authService.verifyCode(verifyData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          // Now we have the userId from verification, proceed with password reset
          const resetData: ResetPasswordDto = {
            newPassword: this.resetForm.value.newPassword,
            userId: response.id // Use the userId from verification response
          };
          
          this.performPasswordReset(resetData);
        },
        error: (error) => this.handleResetError(error)
      });
  }

  private performPasswordReset(resetData: ResetPasswordDto): void {
    this.authService.resetPassword(resetData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.handleResetSuccess(),
        error: (error) => this.handleResetError(error)
      });
  }

  private handleResetSuccess(): void {
    this.isLoading.set(false);
    this.successMessage.set('Password reset successfully! Redirecting to login...');
    
    sessionStorage.removeItem('resetEmail');
    sessionStorage.removeItem('resetToken');
    
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 2000);
  }

  private handleResetError(error: any): void {
    this.isLoading.set(false);
    
    let errorMessage = 'Password reset failed. Please try again.';
    
    if (error?.error?.message && Array.isArray(error.error.message)) {
      errorMessage = error.error.message[0];
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    this.errorMessage.set(errorMessage);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.resetForm.controls).forEach(key => {
      this.resetForm.get(key)?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}