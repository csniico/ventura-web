import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/models/resource.model';
import { PaginationComponent } from '../../../../shared/components/pagination.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent {
  @Input() products: Product[] = [];
  @Input() isLoading = false;
  @Input() totalProducts = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 12;

  @Output() productView = new EventEmitter<Product>();
  @Output() productEdit = new EventEmitter<Product>();
  @Output() productDelete = new EventEmitter<Product>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() createProduct = new EventEmitter<void>();

  protected onEdit(event: Event, product: Product): void {
    event.stopPropagation();
    this.productEdit.emit(product);
  }

  protected onDelete(event: Event, product: Product): void {
    event.stopPropagation();
    this.productDelete.emit(product);
  }
}
