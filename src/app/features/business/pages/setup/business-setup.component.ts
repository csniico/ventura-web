import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../services/business.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { LoadingSpinnerComponent } from '../../../auth/components/loading-spinner.component';
import { StepIndicatorComponent } from '../../components/step-indicator.component';
import { SuccessAnimationComponent } from '../../components/success-animation.component';
import { BusinessStep, CreateBusinessDto, BUSINESS_CATEGORIES } from '../../../../shared/models/business.model';
import { CustomValidators } from '../../../../shared/validators';

@Component({
  selector: 'app-business-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, StepIndicatorComponent, SuccessAnimationComponent],
  templateUrl: './business-setup.component.html'
})
export class BusinessSetupComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly destroy$ = new Subject<void>();

  protected currentStep = signal(1);
  protected isLoading = signal(false);
  protected errorMessage = signal('');
  protected showSuccess = signal(false);
  protected isUploadingLogo = signal(false);
  protected categories = BUSINESS_CATEGORIES;
  private autoSaveTimer: any;

  protected steps: BusinessStep[] = [
    { id: 1, title: 'Business Info', description: 'Basic information about your business', isCompleted: false, isActive: true },
    { id: 2, title: 'Contact Details', description: 'How customers can reach you', isCompleted: false, isActive: false },
    { id: 3, title: 'Location', description: 'Where your business is located', isCompleted: false, isActive: false },
    { id: 4, title: 'Branding', description: 'Make your business stand out', isCompleted: false, isActive: false }
  ];

  protected readonly businessForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    categories: this.fb.array([], [Validators.required]),
    email: ['', [Validators.email]],
    phone: ['', [Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]],
    address: [''],
    city: [''],
    state: [''],
    country: [''],
    description: ['', [Validators.maxLength(500)]],
    tagLine: ['', [Validators.maxLength(100)]],
    logo: ['']
  });

  get categoriesArray() { return this.businessForm.get('categories') as FormArray; }
  get name() { return this.businessForm.get('name'); }
  get email() { return this.businessForm.get('email'); }
  get phone() { return this.businessForm.get('phone'); }
  get description() { return this.businessForm.get('description'); }
  get tagLine() { return this.businessForm.get('tagLine'); }

  ngOnInit(): void {
    this.initializeForm();
    this.loadSavedProgress();
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const user = this.authService.getCurrentUser();
    if (user?.email) {
      this.businessForm.patchValue({ email: user.email });
    }
  }

  protected onCategoryChange(category: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const categoriesArray = this.categoriesArray;

    if (checkbox.checked) {
      categoriesArray.push(this.fb.control(category));
    } else {
      const index = categoriesArray.controls.findIndex(x => x.value === category);
      if (index >= 0) {
        categoriesArray.removeAt(index);
      }
    }
  }

  protected isCategorySelected(category: string): boolean {
    return this.categoriesArray.value.includes(category);
  }

  protected nextStep(): void {
    if (!this.isCurrentStepValid()) return;

    this.markCurrentStepCompleted();
    
    if (this.currentStep() < 4) {
      this.currentStep.set(this.currentStep() + 1);
      this.updateStepStates();
    }
  }

  protected previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
      this.updateStepStates();
    }
  }

  protected skipStep(): void {
    this.nextStep();
  }

  protected onSubmit(): void {
    if (!this.isCurrentStepValid()) return;
    this.createBusiness();
  }

  protected isCurrentStepValid(): boolean {
    const step = this.currentStep();
    
    switch (step) {
      case 1:
        return (this.name?.valid ?? false) && this.categoriesArray.length > 0;
      case 2:
        return !this.email?.value || (this.email?.valid ?? false);
      case 3:
        return true;
      case 4:
        return !this.description?.value || (this.description?.valid ?? false);
      default:
        return false;
    }
  }

  private markCurrentStepCompleted(): void {
    const stepIndex = this.currentStep() - 1;
    this.steps[stepIndex].isCompleted = true;
  }

  private updateStepStates(): void {
    this.steps.forEach((step, index) => {
      step.isActive = index === this.currentStep() - 1;
    });
  }

  private createBusiness(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.errorMessage.set('User not found. Please log in again.');
      this.isLoading.set(false);
      return;
    }

    const formValue = this.businessForm.value;
    const businessData: CreateBusinessDto = {
      ownerId: user.id,
      name: formValue.name,
      categories: formValue.categories,
      email: formValue.email || undefined,
      phone: formValue.phone || undefined,
      description: formValue.description || undefined,
      tagLine: formValue.tagLine || undefined,
      logo: formValue.logo || undefined,
      address: formValue.address || undefined,
      city: formValue.city || undefined,
      state: formValue.state || undefined,
      country: formValue.country || undefined
    };

    this.businessService.createBusiness(businessData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (business) => this.handleSuccess(business),
        error: (error) => this.handleError(error)
      });
  }

  private handleSuccess(business: any): void {
    this.isLoading.set(false);
    
    const user = this.authService.getCurrentUser();
    if (user) {
      user.businessId = business.id;
      localStorage.setItem('user', JSON.stringify(user));
      this.authService.user.set(user);
    }

    localStorage.removeItem('businessSetupProgress');
    this.showSuccess.set(true);
    
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 3000);
  }

  private handleError(error: any): void {
    this.isLoading.set(false);
    
    let errorMessage = 'Failed to create business. Please try again.';
    
    if (error?.error?.message && Array.isArray(error.error.message)) {
      errorMessage = error.error.message[0];
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    this.errorMessage.set(errorMessage);
  }

  private setupAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      this.saveProgress();
    }, 30000);

    this.businessForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.saveProgress();
      });
  }

  private saveProgress(): void {
    const progress = {
      currentStep: this.currentStep(),
      formData: this.businessForm.value,
      timestamp: Date.now()
    };
    localStorage.setItem('businessSetupProgress', JSON.stringify(progress));
  }

  private loadSavedProgress(): void {
    const saved = localStorage.getItem('businessSetupProgress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        if (Date.now() - progress.timestamp < 24 * 60 * 60 * 1000) {
          this.currentStep.set(progress.currentStep);
          this.businessForm.patchValue(progress.formData);
          
          if (progress.formData.categories) {
            const categoriesArray = this.categoriesArray;
            categoriesArray.clear();
            progress.formData.categories.forEach((cat: string) => {
              categoriesArray.push(this.fb.control(cat));
            });
          }
          
          this.updateStepStates();
        }
      } catch (error) {
        console.warn('Failed to load saved progress:', error);
      }
    }
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('Please select an image file.');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage.set('Image size must be less than 10MB.');
        return;
      }
      
      this.uploadLogo(file);
    }
  }

  private uploadLogo(file: File): void {
    this.isUploadingLogo.set(true);
    this.errorMessage.set('');
    
    // Compress image before upload
    this.compressImage(file).then(compressedFile => {
      // Upload compressed image
      this.imageUploadService.uploadImage(compressedFile).then(response => {
        this.businessForm.patchValue({ logo: response.imageUrl });
        this.isUploadingLogo.set(false);
      }).catch(error => {
        this.isUploadingLogo.set(false);
        this.errorMessage.set('Failed to upload logo. Please try again.');
        console.error('Logo upload error:', error);
      });
    }).catch(error => {
      this.isUploadingLogo.set(false);
      this.errorMessage.set('Failed to process image. Please try again.');
      console.error('Image compression error:', error);
    });
  }

  private compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // More aggressive compression - max 400px and lower quality
        const maxSize = 400;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress with lower quality
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            console.log(`Compressed from ${file.size} to ${blob.size} bytes`);
            resolve(compressedFile);
          }
        }, 'image/jpeg', 0.5); // 50% quality for more compression
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
}