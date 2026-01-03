import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class EnhancedValidators {
  // Email validation
  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { email: true };
  }

  // Strong password validation (matches backend requirements)
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const password = control.value;
    const errors: ValidationErrors = {};

    // Length check (6-20 characters)
    if (password.length < 6) {
      errors['minLength'] = { requiredLength: 6, actualLength: password.length };
    }
    if (password.length > 20) {
      errors['maxLength'] = { requiredLength: 20, actualLength: password.length };
    }

    // At least one lowercase letter
    if (!/[a-z]/.test(password)) {
      errors['lowercase'] = true;
    }

    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors['uppercase'] = true;
    }

    // At least one number
    if (!/\d/.test(password)) {
      errors['number'] = true;
    }

    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors['specialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Name validation (1-25 characters)
  static name(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const name = control.value.trim();
    if (name.length < 1) {
      return { minLength: { requiredLength: 1, actualLength: name.length } };
    }
    if (name.length > 25) {
      return { maxLength: { requiredLength: 25, actualLength: name.length } };
    }

    return null;
  }

  // Required field validator
  static required(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
      return { required: true };
    }
    return null;
  }

  // Password confirmation validator
  static passwordMatch(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordField);
      const confirmPassword = control.get(confirmPasswordField);

      if (!password || !confirmPassword) {
        return null;
      }

      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  // Verification code validator (6 digits)
  static verificationCode(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const code = control.value.toString();
    const codeRegex = /^\d{6}$/;
    return codeRegex.test(code) ? null : { verificationCode: true };
  }

  // URL validation (optional)
  static url(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const urlRegex = /^https:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/.*)?$/;
    return urlRegex.test(control.value) ? null : { url: true };
  }
}