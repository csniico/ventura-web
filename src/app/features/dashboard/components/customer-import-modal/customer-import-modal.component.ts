import { Component, inject, signal, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CustomerService } from '../../../../core/services/customer.service';
import { CreateCustomerDto } from '../../../../shared/models/customer.model';

interface ParsedCustomer {
  name: string;
  email: string;
  phone: string;
  notes: string;
  valid: boolean;
}

@Component({
  selector: 'app-customer-import-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-import-modal.component.html',
})
export class CustomerImportModalComponent {
  private readonly customerService = inject(CustomerService);
  private readonly destroy$ = new Subject<void>();

  @Input({ required: true }) businessId!: string;
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() imported = new EventEmitter<number>();

  protected parsedCustomers = signal<ParsedCustomer[]>([]);
  protected isImporting = signal(false);
  protected error = signal('');
  protected fileName = signal('');

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.fileName.set(file.name);
    this.error.set('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.parseCsv(text);
    };
    reader.readAsText(file);
  }

  private parseCsv(text: string): void {
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length < 2) {
      this.error.set('CSV must have a header row and at least one data row');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const nameIdx = headers.findIndex((h) => h === 'name');
    const emailIdx = headers.findIndex((h) => h === 'email');
    const phoneIdx = headers.findIndex((h) => h === 'phone');
    const notesIdx = headers.findIndex((h) => h === 'notes');

    if (nameIdx === -1) {
      this.error.set('CSV must have a "name" column');
      return;
    }

    const customers: ParsedCustomer[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      const name = cols[nameIdx] || '';
      customers.push({
        name,
        email: emailIdx >= 0 ? cols[emailIdx] || '' : '',
        phone: phoneIdx >= 0 ? cols[phoneIdx] || '' : '',
        notes: notesIdx >= 0 ? cols[notesIdx] || '' : '',
        valid: name.length > 0,
      });
    }

    this.parsedCustomers.set(customers);
  }

  protected onImport(): void {
    const valid = this.parsedCustomers().filter((c) => c.valid);
    if (valid.length === 0) {
      this.error.set('No valid customers to import');
      return;
    }

    this.isImporting.set(true);
    const dtos: CreateCustomerDto[] = valid.map((c) => ({
      businessId: this.businessId,
      name: c.name,
      email: c.email || undefined,
      phone: c.phone || undefined,
      notes: c.notes || undefined,
    }));

    this.customerService
      .importCustomers(dtos)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.error.set('Import failed. Please try again.');
          this.isImporting.set(false);
          return of(null);
        })
      )
      .subscribe((result) => {
        this.isImporting.set(false);
        if (result) {
          this.imported.emit(result.imported);
          this.close();
        }
      });
  }

  protected close(): void {
    this.parsedCustomers.set([]);
    this.fileName.set('');
    this.error.set('');
    this.closed.emit();
  }

  protected removeCustomer(index: number): void {
    this.parsedCustomers.update((list) => list.filter((_, i) => i !== index));
  }
}
