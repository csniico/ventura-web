import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Customer, CreateCustomerDto } from '../../shared/models/customer.model';
import { API_ENDPOINTS, PaginatedResponse, withId, withIds } from '../../shared';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);

  /**
   * Paginated customers. The new backend derives the business from the bearer
   * token (businessId param is ignored) and returns a { data, meta } envelope,
   * which we adapt to the { customers, total } shape the UI expects.
   */
  getBusinessCustomers(
    businessId: string,
    limit = 50,
    page = 1,
  ): Observable<{ customers: Customer[]; total: number }> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<PaginatedResponse<any>>(API_ENDPOINTS.CUSTOMERS.BASE, { params })
      .pipe(map((res) => ({ customers: withIds(res.data) as Customer[], total: res.meta?.total ?? 0 })));
  }

  getCustomers(businessId: string): Observable<Customer[]> {
    return this.getBusinessCustomers(businessId, 100, 1).pipe(map((r) => r.customers));
  }

  getRecentCustomers(businessId: string, limit = 5): Observable<Customer[]> {
    return this.getBusinessCustomers(businessId, limit, 1).pipe(map((r) => r.customers));
  }

  getCustomerById(customerId: string, businessId: string): Observable<Customer> {
    return this.http
      .get<any>(API_ENDPOINTS.CUSTOMERS.BY_ID(customerId))
      .pipe(map((c) => withId(c) as Customer));
  }

  createCustomer(customer: CreateCustomerDto): Observable<Customer> {
    return this.http
      .post<any>(API_ENDPOINTS.CUSTOMERS.BASE, this.stripBusinessId(customer))
      .pipe(map((c) => withId(c) as Customer));
  }

  updateCustomer(
    customerId: string,
    businessId: string,
    customerData: Partial<Customer>,
  ): Observable<Customer> {
    return this.http
      .patch<any>(API_ENDPOINTS.CUSTOMERS.BY_ID(customerId), this.stripBusinessId(customerData))
      .pipe(map((c) => withId(c) as Customer));
  }

  deleteCustomer(customerId: string, businessId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.CUSTOMERS.BY_ID(customerId));
  }

  importCustomers(
    customers: CreateCustomerDto[],
  ): Observable<{ imported: number; failed: number }> {
    const payload = { customers: customers.map((c) => this.stripBusinessId(c)) };
    return this.http
      .post<{ created?: any[]; skipped?: any[]; failed?: any[] }>(API_ENDPOINTS.CUSTOMERS.IMPORT, payload)
      .pipe(
        map((res) => ({
          imported: res.created?.length ?? 0,
          failed: (res.failed?.length ?? 0) + (res.skipped?.length ?? 0),
        })),
      );
  }

  // The API rejects unknown/owner-scoped props; business is taken from the token.
  private stripBusinessId<T extends Record<string, any>>(obj: T): Omit<T, 'businessId'> {
    const { businessId, ...rest } = obj as Record<string, any>;
    return rest as Omit<T, 'businessId'>;
  }
}
