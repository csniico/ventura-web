import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static email(control: AbstractControl): ValidationErrors | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return control.value && !emailRegex.test(control.value) ? { email: true } : null;
  }

  // Strong password validator
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isValidLength = value.length >= 8;

      const errors: any = {};
      
      if (!isValidLength) errors.minLength = true;
      if (!hasUpperCase) errors.upperCase = true;
      if (!hasLowerCase) errors.lowerCase = true;
      if (!hasNumeric) errors.numeric = true;
      if (!hasSpecialChar) errors.specialChar = true;

      return Object.keys(errors).length ? { strongPassword: errors } : null;
    };
  }

  // Name validator (letters, spaces, hyphens only)
  static validName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const namePattern = /^[a-zA-Z\s\-']+$/;
      return namePattern.test(value) ? null : { invalidName: true };
    };
  }

  // Verification code validator (6 characters - letters and numbers)
  static verificationCode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const codePattern = /^[a-zA-Z0-9]{6}$/;
      return codePattern.test(value) ? null : { invalidCode: true };
    };
  }

  static passwordMatch(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('newPassword');
      const confirmPassword = control.get('confirmPassword');

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ mismatch: true });
        return { mismatch: true };
      }

      // Clear mismatch error if passwords match
      if (confirmPassword.errors?.['mismatch']) {
        delete confirmPassword.errors['mismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }

      return null;
    };
  }

  // Get password strength level
  static getPasswordStrength(password: string): { level: number; text: string; color: string } {
    if (!password) return { level: 0, text: 'Enter password', color: 'text-gray-400' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      upperCase: /[A-Z]/.test(password),
      lowerCase: /[a-z]/.test(password),
      numeric: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score < 2) return { level: 1, text: 'Weak', color: 'text-red-500' };
    if (score < 4) return { level: 2, text: 'Fair', color: 'text-yellow-500' };
    if (score < 5) return { level: 3, text: 'Good', color: 'text-blue-500' };
    return { level: 4, text: 'Strong', color: 'text-green-500' };
  }
}