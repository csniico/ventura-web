import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner.component';
import { ConfirmEmailDto } from '../../../../shared/models/auth.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  protected isLoading = signal(false);
  protected errorMessage = signal('');
  protected successMessage = signal('');

  protected readonly forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get email() { return this.forgotForm.get('email'); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.email?.markAsTouched();
      return;
    }

    this.sendResetCode();
  }

  private sendResetCode(): void {
    this.isLoading.set(true);
    this.clearMessages();

    const emailData: ConfirmEmailDto = { email: this.forgotForm.value.email };
    
    this.authService.confirmEmail(emailData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => this.handleSendSuccess(emailData.email, response),
        error: (error) => this.handleSendError(error)
      });
  }

  private handleSendSuccess(email: string, response: any): void {
    this.isLoading.set(false);
    this.successMessage.set('Reset code sent! Check your email.');
    
    sessionStorage.setItem('resetEmail', email);
    sessionStorage.setItem('resetToken', response.id || response.shortToken || '');
    
    setTimeout(() => {
      this.router.navigate(['/auth/reset-password']);
    }, 2000);
  }

  private handleSendError(error: any): void {
    this.isLoading.set(false);
    
    let errorMessage = 'Failed to send reset code. Please try again.';
    
    if (error?.error?.message && Array.isArray(error.error.message)) {
      errorMessage = error.error.message[0];
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    this.errorMessage.set(errorMessage);
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}