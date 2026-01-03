import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner.component';
import { LoginDto } from '../../../../shared/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  protected isLoading = signal(false);
  protected errorMessage = signal('');

  protected readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  protected onGoogleSignIn(): void {
    this.authService.loginWithGoogle();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.performLogin();
  }

  private performLogin(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials: LoginDto = this.loginForm.value;
    
    this.authService.login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.handleLoginSuccess(),
        error: (error) => this.handleLoginError(error)
      });
  }

  private handleLoginSuccess(): void {
    this.isLoading.set(false);
    // Navigation handled by AuthService
  }

  private handleLoginError(error: any): void {
    this.isLoading.set(false);
    
    // Extract error message from HTTP response
    let errorMessage = 'Login failed. Please try again.';
    
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.status === 404) {
      errorMessage = 'User not found. Please check your credentials.';
    } else if (error?.status === 401) {
      errorMessage = 'Invalid credentials. Please try again.';
    }
    
    this.errorMessage.set(errorMessage);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}