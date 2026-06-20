import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, PaginatedResponse, withId } from '../../shared';
import {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoicePaymentDto,
  UpdateInvoiceStatusDto,
  InvoiceStatus,
  PaginatedInvoices,
} from '../models/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly http = inject(HttpClient);

  getInvoices(
    businessId: string,
    status?: InvoiceStatus,
    customerId?: string,
    limit?: number,
    page?: number,
  ): Observable<PaginatedInvoices> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (customerId) params = params.set('customerId', customerId);
    if (limit) params = params.set('limit', limit);
    if (page) params = params.set('page', page);
    return this.http
      .get<PaginatedResponse<any>>(API_ENDPOINTS.INVOICES.BASE, { params })
      .pipe(map((res) => this.toPaginated(res)));
  }

  getInvoiceById(invoiceId: string, businessId: string): Observable<Invoice> {
    return this.http.get<any>(API_ENDPOINTS.INVOICES.BY_ID(invoiceId)).pipe(map((i) => withId(i) as Invoice));
  }

  createInvoice(dto: CreateInvoiceDto): Observable<Invoice> {
    const d = dto as any;
    const payload: Record<string, unknown> = { orderIds: d.orderIds ?? [] };
    if (d.invoiceType) payload['invoiceType'] = d.invoiceType;
    if (d.dueDate) payload['dueDate'] = d.dueDate;
    if (d.notes) payload['notes'] = d.notes;
    return this.http.post<any>(API_ENDPOINTS.INVOICES.BASE, payload).pipe(map((i) => withId(i) as Invoice));
  }

  updateInvoicePayment(
    invoiceId: string,
    businessId: string,
    dto: UpdateInvoicePaymentDto,
  ): Observable<Invoice> {
    const d = dto as any;
    const payload = {
      amount: d.amount ?? d.amountPaid,
      paymentMethod: d.paymentMethod,
      paymentDate: d.paymentDate,
    };
    return this.http
      .patch<any>(API_ENDPOINTS.INVOICES.PAYMENT(invoiceId), payload)
      .pipe(map((i) => withId(i) as Invoice));
  }

  updateInvoiceStatus(
    invoiceId: string,
    businessId: string,
    dto: UpdateInvoiceStatusDto,
  ): Observable<Invoice> {
    return this.http
      .patch<any>(API_ENDPOINTS.INVOICES.STATUS(invoiceId), dto)
      .pipe(map((i) => withId(i) as Invoice));
  }

  /** Send the invoice to the customer (email + optional message). */
  sendInvoice(invoiceId: string, email?: string, message?: string): Observable<Invoice> {
    return this.http
      .post<any>(API_ENDPOINTS.INVOICES.SEND(invoiceId), { email, message })
      .pipe(map((i) => withId(i) as Invoice));
  }

  getCustomerInvoices(
    customerId: string,
    businessId: string,
    limit?: number,
    page?: number,
  ): Observable<PaginatedInvoices> {
    return this.getInvoices(businessId, undefined, customerId, limit, page);
  }

  private toPaginated(res: PaginatedResponse<any>): PaginatedInvoices {
    return {
      invoices: (res.data ?? []).map((i) => withId(i) as Invoice),
      total: res.meta?.total ?? 0,
      page: res.meta?.page ?? 1,
      limit: res.meta?.limit ?? 20,
      totalPages: res.meta?.totalPages ?? 1,
    };
  }
}
