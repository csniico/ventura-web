import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '../../../../core/models/resource.model';
import { PaginationComponent } from '../../../../shared/components/pagination.component';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './service-list.component.html'
})
export class ServiceListComponent {
  @Input() services: Service[] = [];
  @Input() isLoading = false;
  @Input() totalServices = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 12;

  @Output() serviceEdit = new EventEmitter<Service>();
  @Output() serviceDelete = new EventEmitter<Service>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() createService = new EventEmitter<void>();

  protected onEdit(event: Event, service: Service): void {
    event.stopPropagation();
    this.serviceEdit.emit(service);
  }

  protected onDelete(event: Event, service: Service): void {
    event.stopPropagation();
    this.serviceDelete.emit(service);
  }
}
