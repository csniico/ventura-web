import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner.component';
import { SignUpDto } from '../../../../shared/models/auth.model';
import { CustomValidators } from '../../../../shared/validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  protected isLoading = signal(false);
  protected errorMessage = signal('');
  protected passwordStrength = signal({ level: 0, text: 'Enter password', color: 'text-gray-400' });

  protected readonly registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(25), CustomValidators.validName()]],
    lastName: ['', [Validators.maxLength(25), CustomValidators.validName()]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), CustomValidators.strongPassword()]]
  });

  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }

protected onGoogleSignUp(): void {  }  // Google sign up uses the same OAuth flow as sign in    this.authService.loginWithGoogle();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onPasswordChange(): void {
    const password = this.password?.value || '';
    this.passwordStrength.set(CustomValidators.getPasswordStrength(password));
  }

  protected onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.performRegistration();
  }

  private performRegistration(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const userData: SignUpDto = {
      ...this.registerForm.value,
      lastName: this.registerForm.value.lastName || undefined
    };
    
    this.authService.register(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.handleRegistrationSuccess(response, userData.email),
        error: (error) => this.handleRegistrationError(error)
      });
  }

  private handleRegistrationSuccess(response: any, email: string): void {
    this.isLoading.set(false);
    
    sessionStorage.setItem('shortToken', response.shortToken);
    sessionStorage.setItem('verificationEmail', email);
    
    this.router.navigate(['/auth/verify-email']);
  }

  private handleRegistrationError(error: any): void {
    this.isLoading.set(false);
    
    // Extract error message from HTTP response
    let errorMessage = 'Registration failed. Please try again.';
    
    // Handle array of error messages (validation errors)
    if (error?.error?.message && Array.isArray(error.error.message)) {
      errorMessage = error.error.message[0]; // Show first error
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    this.errorMessage.set(errorMessage);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }
}