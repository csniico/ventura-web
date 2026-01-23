import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Order, CreateOrderDto, CreateOrderItemDto, ItemType, OrderStatus } from '../../../../core/models/order.model';
import { Customer } from '../../../../core/models/customer.model';
import { Product, Service } from '../../../../core/models/resource.model';
import { ResourceService } from '../../../../core/services/resource.service';
import { catchError, of, forkJoin } from 'rxjs';

interface LineItem {
  itemType: ItemType;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  subTotal: number;
}

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-modal.component.html'
})
export class OrderModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() order: Order | null = null;
  @Input() customers: Customer[] = [];
  @Input() businessId = '';
  @Input() viewMode = false;

  @Output() save = new EventEmitter<CreateOrderDto>();
  @Output() close = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly resourceService = inject(ResourceService);

  protected orderForm!: FormGroup;
  protected readonly isSubmitting = signal(false);
  protected readonly lineItems = signal<LineItem[]>([]);

  // Item selector state
  protected readonly isItemSelectorOpen = signal(false);
  protected readonly itemSelectorType = signal<'product' | 'service'>('product');
  protected readonly isLoadingItems = signal(false);
  protected readonly products = signal<Product[]>([]);
  protected readonly services = signal<Service[]>([]);

  protected readonly orderTotal = computed(() =>
    this.lineItems().reduce((sum, item) => sum + item.subTotal, 0)
  );

  protected readonly availableItems = computed(() =>
    this.itemSelectorType() === 'product' ? this.products() : this.services()
  );

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen && !this.viewMode) {
        this.initForm();
        this.lineItems.set([]);
        this.loadResources();
      }
    }
  }

  private initForm(): void {
    this.orderForm = this.fb.group({
      customerId: ['', Validators.required]
    });
  }

  private loadResources(): void {
    if (!this.businessId) return;

    this.isLoadingItems.set(true);
    forkJoin({
      products: this.resourceService.getProducts(this.businessId).pipe(catchError(() => of([]))),
      services: this.resourceService.getServices(this.businessId).pipe(catchError(() => of([])))
    }).subscribe(({ products, services }) => {
      this.products.set(products);
      this.services.set(services);
      this.isLoadingItems.set(false);
    });
  }

  protected openItemSelector(type: 'product' | 'service'): void {
    this.itemSelectorType.set(type);
    this.isItemSelectorOpen.set(true);
  }

  protected closeItemSelector(): void {
    this.isItemSelectorOpen.set(false);
  }

  protected addItem(item: Product | Service): void {
    const existingIndex = this.lineItems().findIndex(
      li => li.itemId === item.id && li.itemType === this.itemSelectorType()
    );

    if (existingIndex >= 0) {
      // Update quantity if item already exists
      this.updateQuantity(existingIndex, 1);
    } else {
      // Add new item
      const newItem: LineItem = {
        itemType: this.itemSelectorType() === 'product' ? ItemType.PRODUCT : ItemType.SERVICE,
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        subTotal: item.price
      };
      this.lineItems.update(items => [...items, newItem]);
    }

    this.closeItemSelector();
  }

  protected updateQuantity(index: number, delta: number): void {
    this.lineItems.update(items => {
      const newItems = [...items];
      const item = newItems[index];
      const newQuantity = Math.max(1, item.quantity + delta);
      newItems[index] = {
        ...item,
        quantity: newQuantity,
        subTotal: item.price * newQuantity
      };
      return newItems;
    });
  }

  protected removeItem(index: number): void {
    this.lineItems.update(items => items.filter((_, i) => i !== index));
  }

  protected getStatusClasses(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-amber-50 text-amber-700';
      case OrderStatus.COMPLETED:
        return 'bg-green-50 text-green-700';
      case OrderStatus.CANCELLED:
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  }

  protected getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.COMPLETED:
        return 'Completed';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  }

  protected onSubmit(): void {
    if (this.orderForm.invalid || this.lineItems().length === 0) return;

    this.isSubmitting.set(true);

    const items: CreateOrderItemDto[] = this.lineItems().map(item => ({
      itemType: item.itemType,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      ...(item.itemType === ItemType.PRODUCT ? { productId: item.itemId } : { serviceId: item.itemId })
    }));

    const dto: CreateOrderDto = {
      businessId: this.businessId,
      customerId: this.orderForm.value.customerId,
      items
    };

    this.save.emit(dto);
    this.isSubmitting.set(false);
  }

  protected onCancel(): void {
    this.close.emit();
  }
}
