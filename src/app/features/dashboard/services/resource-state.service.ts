import { Injectable, computed, signal } from '@angular/core';
import { Product, Service } from '../../../core/models/resource.model';

export type ResourceTab = 'products' | 'services';

interface ResourceFilters {
  searchQuery: string;
  sortBy: 'name' | 'price' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class ResourceStateService {
  // Products state
  private readonly _products = signal<Product[]>([]);
  private readonly _productsLoading = signal(false);

  // Services state
  private readonly _services = signal<Service[]>([]);
  private readonly _servicesLoading = signal(false);

  // UI state
  private readonly _activeTab = signal<ResourceTab>('products');
  private readonly _filters = signal<ResourceFilters>({
    searchQuery: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Modal state
  private readonly _isModalOpen = signal(false);
  private readonly _modalMode = signal<'create' | 'edit'>('create');
  private readonly _selectedProduct = signal<Product | null>(null);
  private readonly _selectedService = signal<Service | null>(null);

  // Delete confirmation state
  private readonly _isDeleteModalOpen = signal(false);
  private readonly _itemToDelete = signal<{ type: 'product' | 'service'; item: Product | Service } | null>(null);

  // Pagination
  private readonly _currentPage = signal(1);
  private readonly _pageSize = signal(12);

  // Public accessors
  readonly products = this._products.asReadonly();
  readonly services = this._services.asReadonly();
  readonly productsLoading = this._productsLoading.asReadonly();
  readonly servicesLoading = this._servicesLoading.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly isModalOpen = this._isModalOpen.asReadonly();
  readonly modalMode = this._modalMode.asReadonly();
  readonly selectedProduct = this._selectedProduct.asReadonly();
  readonly selectedService = this._selectedService.asReadonly();
  readonly isDeleteModalOpen = this._isDeleteModalOpen.asReadonly();
  readonly itemToDelete = this._itemToDelete.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();

  // Computed values
  readonly isLoading = computed(() =>
    this._activeTab() === 'products' ? this._productsLoading() : this._servicesLoading()
  );

  readonly filteredProducts = computed(() => {
    const products = this._products();
    const { searchQuery, sortBy, sortOrder } = this._filters();

    let filtered = products;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    return this.sortItems(filtered, sortBy, sortOrder);
  });

  readonly filteredServices = computed(() => {
    const services = this._services();
    const { searchQuery, sortBy, sortOrder } = this._filters();

    let filtered = services;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      );
    }

    return this.sortItems(filtered, sortBy, sortOrder);
  });

  readonly paginatedProducts = computed(() => {
    const filtered = this.filteredProducts();
    const page = this._currentPage();
    const size = this._pageSize();
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  });

  readonly paginatedServices = computed(() => {
    const filtered = this.filteredServices();
    const page = this._currentPage();
    const size = this._pageSize();
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  });

  readonly totalProducts = computed(() => this.filteredProducts().length);
  readonly totalServices = computed(() => this.filteredServices().length);

  // Stats
  readonly productStats = computed(() => {
    const products = this._products();
    return {
      total: products.length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.availableQuantity), 0),
      lowStock: products.filter(p => p.availableQuantity <= 5).length,
      outOfStock: products.filter(p => p.availableQuantity === 0).length
    };
  });

  readonly serviceStats = computed(() => {
    const services = this._services();
    return {
      total: services.length,
      averagePrice: services.length > 0
        ? services.reduce((sum, s) => sum + s.price, 0) / services.length
        : 0
    };
  });

  // Actions
  setProducts(products: Product[]): void {
    this._products.set(products);
  }

  setServices(services: Service[]): void {
    this._services.set(services);
  }

  setProductsLoading(loading: boolean): void {
    this._productsLoading.set(loading);
  }

  setServicesLoading(loading: boolean): void {
    this._servicesLoading.set(loading);
  }

  setActiveTab(tab: ResourceTab): void {
    this._activeTab.set(tab);
    this._currentPage.set(1);
  }

  setSearchQuery(query: string): void {
    this._filters.update(f => ({ ...f, searchQuery: query }));
    this._currentPage.set(1);
  }

  setSorting(sortBy: ResourceFilters['sortBy'], sortOrder: ResourceFilters['sortOrder']): void {
    this._filters.update(f => ({ ...f, sortBy, sortOrder }));
  }

  setCurrentPage(page: number): void {
    this._currentPage.set(page);
  }

  // Product actions
  addProduct(product: Product): void {
    this._products.update(products => [product, ...products]);
  }

  updateProduct(updatedProduct: Product): void {
    this._products.update(products =>
      products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  }

  removeProduct(productId: string): void {
    this._products.update(products => products.filter(p => p.id !== productId));
  }

  // Service actions
  addService(service: Service): void {
    this._services.update(services => [service, ...services]);
  }

  updateService(updatedService: Service): void {
    this._services.update(services =>
      services.map(s => s.id === updatedService.id ? updatedService : s)
    );
  }

  removeService(serviceId: string): void {
    this._services.update(services => services.filter(s => s.id !== serviceId));
  }

  // Modal actions
  openCreateModal(type: 'product' | 'service'): void {
    this._modalMode.set('create');
    this._selectedProduct.set(null);
    this._selectedService.set(null);
    this._isModalOpen.set(true);
  }

  openEditProductModal(product: Product): void {
    this._modalMode.set('edit');
    this._selectedProduct.set(product);
    this._selectedService.set(null);
    this._isModalOpen.set(true);
  }

  openEditServiceModal(service: Service): void {
    this._modalMode.set('edit');
    this._selectedService.set(service);
    this._selectedProduct.set(null);
    this._isModalOpen.set(true);
  }

  closeModal(): void {
    this._isModalOpen.set(false);
    this._selectedProduct.set(null);
    this._selectedService.set(null);
  }

  // Delete modal actions
  openDeleteModal(type: 'product' | 'service', item: Product | Service): void {
    this._itemToDelete.set({ type, item });
    this._isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this._isDeleteModalOpen.set(false);
    this._itemToDelete.set(null);
  }

  // Helper
  private sortItems<T extends Product | Service>(items: T[], sortBy: string, sortOrder: string): T[] {
    return [...items].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
}
