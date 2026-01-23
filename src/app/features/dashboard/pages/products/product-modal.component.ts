import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product, CreateProductDto } from '../../../../core/models/resource.model';
import { ResourceService } from '../../../../core/services/resource.service';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-modal.component.html'
})
export class ProductModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() product: Product | null = null;
  @Input() businessId = '';

  @Output() save = new EventEmitter<CreateProductDto | { id: string; data: Partial<Product> }>();
  @Output() close = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly resourceService = inject(ResourceService);

  protected productForm!: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isUploadingPrimary = signal(false);
  protected readonly isUploadingSupporting = signal(false);
  protected readonly primaryImageUrl = signal<string | null>(null);
  protected readonly supportingImageUrls = signal<string[]>([]);

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] || changes['isOpen']) {
      if (this.isOpen) {
        this.initForm();
        if (this.product) {
          this.isEditMode.set(true);
          this.populateForm(this.product);
        } else {
          this.isEditMode.set(false);
          this.resetForm();
        }
      }
    }
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      availableQuantity: [0, Validators.min(0)],
      description: [''],
      notes: ['']
    });
  }

  private populateForm(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      availableQuantity: product.availableQuantity,
      description: product.description || '',
      notes: product.notes || ''
    });
    this.primaryImageUrl.set(product.primaryImage || null);
    this.supportingImageUrls.set(product.supportingImages || []);
  }

  private resetForm(): void {
    this.productForm.reset({
      name: '',
      price: 0,
      availableQuantity: 0,
      description: '',
      notes: ''
    });
    this.primaryImageUrl.set(null);
    this.supportingImageUrls.set([]);
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

  protected onSupportingImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploadingSupporting.set(true);
    this.resourceService.uploadImage(file).subscribe({
      next: (response) => {
        this.supportingImageUrls.update(urls => [...urls, response.url]);
        this.isUploadingSupporting.set(false);
      },
      error: () => {
        this.isUploadingSupporting.set(false);
      }
    });
  }

  protected removePrimaryImage(): void {
    this.primaryImageUrl.set(null);
    this.supportingImageUrls.set([]);
  }

  protected removeSupportingImage(index: number): void {
    this.supportingImageUrls.update(urls => urls.filter((_, i) => i !== index));
  }

  protected onSubmit(): void {
    if (this.productForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.productForm.value;

    const data = {
      name: formValue.name,
      price: formValue.price,
      availableQuantity: formValue.availableQuantity,
      description: formValue.description || undefined,
      notes: formValue.notes || undefined,
      primaryImage: this.primaryImageUrl() || undefined,
      supportingImages: this.supportingImageUrls().length > 0 ? this.supportingImageUrls() : undefined
    };

    if (this.isEditMode() && this.product) {
      this.save.emit({ id: this.product.id, data });
    } else {
      this.save.emit({
        ...data,
        businessId: this.businessId
      } as CreateProductDto);
    }

    this.isSubmitting.set(false);
  }

  protected onCancel(): void {
    this.close.emit();
  }
}
