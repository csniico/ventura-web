import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Customer, CreateCustomerDto } from '../../shared/models/customer.model';
import { API_ENDPOINTS } from '../../shared/api.constants';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);

  /**
   * Get all customers for a business with pagination
   */
  getBusinessCustomers(businessId: string, limit: number = 50, page: number = 1): Observable<{ customers: Customer[], total: number }> {
    return this.http.get<{ customers: Customer[], total: number }>(
      `/customers/?filter=many&businessId=${businessId}&limit=${limit}&page=${page}`
    );
  }

  /**
   * Get customers list for a business (for dropdowns/selects)
   */
  getCustomers(businessId: string): Observable<Customer[]> {
    return this.http.get<{ customers: Customer[], total: number }>(
      `/customers/?filter=many&businessId=${businessId}&limit=100&page=1`
    ).pipe(
      map(response => response.customers || [])
    );
  }

  /**
   * Get recent customers for a business
   */
  getRecentCustomers(businessId: string, limit: number = 5): Observable<Customer[]> {
    return this.http.get<{ customers: Customer[], total: number }>(
      `/customers/?filter=many&businessId=${businessId}&limit=${limit}&page=1`
    ).pipe(
      map(response => response.customers || [])
    );
  }

  /**
   * Get a single customer by ID
   */
  getCustomerById(customerId: string, businessId: string): Observable<Customer> {
    return this.http.get<Customer>(
      `/customers/?filter=one&customerId=${customerId}&businessId=${businessId}`
    );
  }

  /**
   * Create a new customer
   */
  createCustomer(customer: CreateCustomerDto): Observable<Customer> {
    return this.http.post<Customer>('/customers', customer);
  }

  /**
   * Update an existing customer
   */
  updateCustomer(customerId: string, businessId: string, customerData: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`/customers/${customerId}`, customerData, {
      params: { businessId }
    });
  }

  /**
   * Delete a customer
   */
  deleteCustomer(customerId: string, businessId: string): Observable<void> {
    return this.http.delete<void>(`/customers/${customerId}?businessId=${businessId}`);
  }
}
