import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Service, CreateServiceDto } from '../../../../core/models/resource.model';
import { ResourceService } from '../../../../core/services/resource.service';

@Component({
  selector: 'app-service-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-modal.component.html'
})
export class ServiceModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() service: Service | null = null;
  @Input() businessId = '';

  @Output() save = new EventEmitter<CreateServiceDto | { id: string; data: Partial<Service> }>();
  @Output() close = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly resourceService = inject(ResourceService);

  protected serviceForm!: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isUploadingPrimary = signal(false);
  protected readonly primaryImageUrl = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['service'] || changes['isOpen']) {
      if (this.isOpen) {
        this.initForm();
        if (this.service) {
          this.isEditMode.set(true);
          this.populateForm(this.service);
        } else {
          this.isEditMode.set(false);
          this.resetForm();
        }
      }
    }
  }

  private initForm(): void {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      notes: ['']
    });
  }

  private populateForm(service: Service): void {
    this.serviceForm.patchValue({
      name: service.name,
      price: service.price,
      description: service.description || '',
      notes: service.notes || ''
    });
    this.primaryImageUrl.set(service.primaryImage || null);
  }

  private resetForm(): void {
    this.serviceForm.reset({
      name: '',
      price: 0,
      description: '',
      notes: ''
    });
    this.primaryImageUrl.set(null);
  }

  protected onPrimaryImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploadingPrimary.set(true);
    this.resourceService.uploadImage(file).subscribe({
      next: (response) => {
        this.primaryImageUrl.set(response.url);
        this.isUploadingPrimary.set(false);
      },
      error: () => {
        this.isUploadingPrimary.set(false);
      }
    });
  }

  protected removePrimaryImage(): void {
    this.primaryImageUrl.set(null);
  }

  protected onSubmit(): void {
    if (this.serviceForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.serviceForm.value;

    const data = {
      name: formValue.name,
      price: formValue.price,
      description: formValue.description || undefined,
      notes: formValue.notes || undefined,
      primaryImage: this.primaryImageUrl() || undefined
    };

    if (this.isEditMode() && this.service) {
      this.save.emit({ id: this.service.id, data });
    } else {
      this.save.emit({
        ...data,
        businessId: this.businessId
      } as CreateServiceDto);
    }

    this.isSubmitting.set(false);
  }

  protected onCancel(): void {
    this.close.emit();
  }
}
