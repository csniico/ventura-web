import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, takeUntil, catchError, of } from 'rxjs';
import { ResourceService } from '../../../../core/services/resource.service';
import { ResourceStateService } from '../../services/resource-state.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../../../core/services/business.service';
import { Product, Service, CreateProductDto, CreateServiceDto } from '../../../../core/models/resource.model';
import { SearchInputComponent } from '../../../../shared/components/search-input.component';
import { DeleteConfirmationComponent, DeleteConfirmationData } from '../../../../shared/components/delete-confirmation.component';
import { ProductListComponent } from './product-list.component';
import { ServiceListComponent } from './service-list.component';
import { ProductModalComponent } from './product-modal.component';
import { ServiceModalComponent } from './service-modal.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    DeleteConfirmationComponent,
    ProductListComponent,
    ServiceListComponent,
    ProductModalComponent,
    ServiceModalComponent
  ],
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit, OnDestroy {
  protected readonly resourceState = inject(ResourceStateService);
  private readonly resourceService = inject(ResourceService);
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly destroy$ = new Subject<void>();

  protected readonly businessId = signal('');
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');

  ngOnInit(): void {
    this.loadBusinessAndResources();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBusinessAndResources(): void {
    this.resourceState.setProductsLoading(true);
    this.resourceState.setServicesLoading(true);

    // First check if business is already loaded
    const currentBusiness = this.businessService.getCurrentBusiness();
    if (currentBusiness) {
      this.businessId.set(currentBusiness.id);
      this.loadResources(currentBusiness.id);
      return;
    }

    // Otherwise fetch it
    this.businessService.fetchOwnerBusiness()
      .pipe(takeUntil(this.destroy$))
      .subscribe(business => {
        if (business) {
          this.businessId.set(business.id);
          this.loadResources(business.id);
        }
      });
  }

  private loadResources(businessId: string): void {
    forkJoin({
      products: this.resourceService.getProducts(businessId).pipe(catchError(() => of([]))),
      services: this.resourceService.getServices(businessId).pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.destroy$))
      .subscribe(({ products, services }) => {
        this.resourceState.setProducts(products);
        this.resourceState.setServices(services);
        this.resourceState.setProductsLoading(false);
        this.resourceState.setServicesLoading(false);
      });
  }

  protected onSearch(query: string): void {
    this.resourceState.setSearchQuery(query);
  }

  protected onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const [sortBy, sortOrder] = value.split('-') as ['name' | 'price' | 'createdAt', 'asc' | 'desc'];
    this.resourceState.setSorting(sortBy, sortOrder);
  }

  protected onPageChange(page: number): void {
    this.resourceState.setCurrentPage(page);
  }

  protected openCreateModal(): void {
    this.resourceState.openCreateModal(this.resourceState.activeTab() === 'products' ? 'product' : 'service');
  }

  protected openEditProductModal(product: Product): void {
    this.resourceState.openEditProductModal(product);
  }

  protected openEditServiceModal(service: Service): void {
    this.resourceState.openEditServiceModal(service);
  }

  protected onSaveProduct(data: CreateProductDto | { id: string; data: Partial<Product> }): void {
    if ('id' in data) {
      this.resourceService.updateProduct(data.id, this.businessId(), data.data)
        .pipe(
          takeUntil(this.destroy$),
          catchError(() => {
            this.showToast('Failed to update product', 'error');
            return of(null);
          })
        )
        .subscribe(product => {
          if (product) {
            this.resourceState.updateProduct(product);
            this.resourceState.closeModal();
            this.showToast(`${product.name} updated successfully`, 'success');
          }
        });
    } else {
      this.resourceService.createProduct(data)
        .pipe(
          takeUntil(this.destroy$),
          catchError(() => {
            this.showToast('Failed to create product', 'error');
            return of(null);
          })
        )
        .subscribe(product => {
          if (product) {
            this.resourceState.addProduct(product);
            this.resourceState.closeModal();
            this.showToast(`${product.name} created successfully`, 'success');
          }
        });
    }
  }

  protected onSaveService(data: CreateServiceDto | { id: string; data: Partial<Service> }): void {
    if ('id' in data) {
      this.resourceService.updateService(data.id, this.businessId(), data.data)
        .pipe(
          takeUntil(this.destroy$),
          catchError(() => {
            this.showToast('Failed to update service', 'error');
            return of(null);
          })
        )
        .subscribe(service => {
          if (service) {
            this.resourceState.updateService(service);
            this.resourceState.closeModal();
            this.showToast(`${service.name} updated successfully`, 'success');
          }
        });
    } else {
      this.resourceService.createService(data)
        .pipe(
          takeUntil(this.destroy$),
          catchError(() => {
            this.showToast('Failed to create service', 'error');
            return of(null);
          })
        )
        .subscribe(service => {
          if (service) {
            this.resourceState.addService(service);
            this.resourceState.closeModal();
            this.showToast(`${service.name} created successfully`, 'success');
          }
        });
    }
  }

  protected onDeleteProduct(product: Product): void {
    this.resourceState.openDeleteModal('product', product);
  }

  protected onDeleteService(service: Service): void {
    this.resourceState.openDeleteModal('service', service);
  }

  protected deleteConfirmationData(): DeleteConfirmationData {
    const item = this.resourceState.itemToDelete();
    return {
      title: item?.type === 'product' ? 'Delete Product' : 'Delete Service',
      message: item ? `Are you sure you want to delete "${item.item.name}"? This action cannot be undone.` : '',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    };
  }

  protected onConfirmDelete(): void {
    const item = this.resourceState.itemToDelete();
    if (!item) return;

    if (item.type === 'product') {
      this.resourceService.deleteProduct(item.item.id, this.businessId())
        .pipe(
          takeUntil(this.destroy$),
          catchError(() => {
            this.showToast('Failed to delete product', 'error');
            return of(null);
          })
        )
        .subscribe(result => {
          if (result !== null) {
            this.resourceState.removeProduct(item.item.id);
            this.showToast(`${item.item.name} deleted`, 'success');
          }
          this.resourceState.closeDeleteModal();
        });
    } else {
      this.resourceService.deleteService(item.item.id, this.businessId())
        .pipe(
          takeUntil(this.destroy$),
          catchError(() => {
            this.showToast('Failed to delete service', 'error');
            return of(null);
          })
        )
        .subscribe(result => {
          if (result !== null) {
            this.resourceState.removeService(item.item.id);
            this.showToast(`${item.item.name} deleted`, 'success');
          }
          this.resourceState.closeDeleteModal();
        });
    }
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}
