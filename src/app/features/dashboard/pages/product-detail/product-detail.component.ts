import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../../../core/services/business.service';
import { ResourceService } from '../../../../core/services/resource.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Product, UpdateProductDto } from '../../../../core/models/resource.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly resourceService = inject(ResourceService);
  private readonly toastService = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  protected isLoading = signal(true);
  protected product = signal<Product | null>(null);
  private businessId = '';

  // Stock adjustment
  protected isStockModalOpen = signal(false);
  protected stockAdjustment = signal(0);
  protected stockAdjustmentType = signal<'set' | 'add' | 'subtract'>('set');
  protected isUpdatingStock = signal(false);

  // Selected image for gallery
  protected selectedImageIndex = signal(0);

  protected stockStatus = computed(() => {
    const p = this.product();
    if (!p) return 'unknown';
    if (p.availableQuantity === 0) return 'out_of_stock';
    if (p.availableQuantity <= 5) return 'low_stock';
    return 'in_stock';
  });

  protected stockStatusLabel = computed(() => {
    const status = this.stockStatus();
    switch (status) {
      case 'out_of_stock': return 'Out of Stock';
      case 'low_stock': return 'Low Stock';
      case 'in_stock': return 'In Stock';
      default: return 'Unknown';
    }
  });

  protected stockStatusClasses = computed(() => {
    const status = this.stockStatus();
    switch (status) {
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'low_stock': return 'bg-amber-100 text-amber-800';
      case 'in_stock': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  });

  protected allImages = computed(() => {
    const p = this.product();
    if (!p) return [];
    const images: string[] = [];
    if (p.primaryImage) images.push(p.primaryImage);
    if (p.supportingImages?.length) images.push(...p.supportingImages);
    return images;
  });

  protected inventoryValue = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return p.price * p.availableQuantity;
  });

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    this.businessId = this.businessService.getCurrentBusiness()?.id ||
      this.businessService.business()?.id ||
      this.authService.user()?.businessId || '';

    if (productId && this.businessId) {
      this.loadProduct(productId);
    } else {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(productId: string): void {
    this.resourceService.getProductById(this.businessId, productId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(null))
      )
      .subscribe(product => {
        this.product.set(product);
        this.isLoading.set(false);
      });
  }

  protected selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  protected openStockModal(): void {
    const p = this.product();
    if (!p) return;
    this.stockAdjustment.set(p.availableQuantity);
    this.stockAdjustmentType.set('set');
    this.isStockModalOpen.set(true);
  }

  protected closeStockModal(): void {
    this.isStockModalOpen.set(false);
  }

  protected onStockAdjustmentTypeChange(type: 'set' | 'add' | 'subtract'): void {
    this.stockAdjustmentType.set(type);
    if (type === 'set') {
      this.stockAdjustment.set(this.product()?.availableQuantity || 0);
    } else {
      this.stockAdjustment.set(0);
    }
  }

  protected get newStockQuantity(): number {
    const current = this.product()?.availableQuantity || 0;
    const adjustment = this.stockAdjustment();
    switch (this.stockAdjustmentType()) {
      case 'set': return Math.max(0, adjustment);
      case 'add': return current + Math.max(0, adjustment);
      case 'subtract': return Math.max(0, current - Math.max(0, adjustment));
    }
  }

  protected onUpdateStock(): void {
    const p = this.product();
    if (!p) return;

    const newQty = this.newStockQuantity;
    this.isUpdatingStock.set(true);

    const dto: UpdateProductDto = { availableQuantity: newQty };
    this.resourceService.updateProduct(p.id, this.businessId, dto)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.toastService.error('Failed to update stock');
          this.isUpdatingStock.set(false);
          return of(null);
        })
      )
      .subscribe(updated => {
        if (updated) {
          this.product.set(updated);
          this.toastService.success(`Stock updated to ${newQty}`);
        }
        this.isUpdatingStock.set(false);
        this.closeStockModal();
      });
  }
}
