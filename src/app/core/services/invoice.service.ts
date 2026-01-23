import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../shared/api.constants';
import {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoicePaymentDto,
  UpdateInvoiceStatusDto,
  InvoiceStatus,
  PaginatedInvoices
} from '../models/invoice.model';

interface InvoicesApiResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly http = inject(HttpClient);

  getInvoices(
    businessId: string,
    status?: InvoiceStatus,
    customerId?: string,
    limit?: number,
    page?: number
  ): Observable<PaginatedInvoices> {
    return this.http.get<InvoicesApiResponse>(
      API_ENDPOINTS.INVOICES.LIST(businessId, status, customerId, limit, page)
    ).pipe(
      map(response => ({
        invoices: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 20,
        totalPages: response.totalPages || 1
      }))
    );
  }

  getInvoiceById(invoiceId: string, businessId: string): Observable<Invoice> {
    return this.http.get<Invoice>(
      API_ENDPOINTS.INVOICES.BY_ID(invoiceId, businessId)
    );
  }

  createInvoice(dto: CreateInvoiceDto): Observable<Invoice> {
    return this.http.post<Invoice>(
      API_ENDPOINTS.INVOICES.CREATE,
      dto
    );
  }

  updateInvoicePayment(invoiceId: string, businessId: string, dto: UpdateInvoicePaymentDto): Observable<Invoice> {
    return this.http.patch<Invoice>(
      API_ENDPOINTS.INVOICES.UPDATE_PAYMENT(invoiceId, businessId),
      dto
    );
  }

  updateInvoiceStatus(invoiceId: string, businessId: string, dto: UpdateInvoiceStatusDto): Observable<Invoice> {
    return this.http.patch<Invoice>(
      API_ENDPOINTS.INVOICES.UPDATE_STATUS(invoiceId, businessId),
      dto
    );
  }

  getCustomerInvoices(
    customerId: string,
    businessId: string,
    limit?: number,
    page?: number
  ): Observable<PaginatedInvoices> {
    return this.http.get<InvoicesApiResponse>(
      API_ENDPOINTS.INVOICES.CUSTOMER_INVOICES(customerId, businessId, limit, page)
    ).pipe(
      map(response => ({
        invoices: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 20,
        totalPages: response.totalPages || 1
      }))
    );
  }
}
