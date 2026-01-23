import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../shared/api.constants';
import {
  Product,
  Service,
  CreateProductDto,
  CreateServiceDto,
  UpdateProductDto,
  UpdateServiceDto,
  ResourceSearchResponse
} from '../models/resource.model';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private readonly http = inject(HttpClient);

  // Get all products (uses search endpoint)
  getProducts(businessId: string): Observable<Product[]> {
    return this.http.get<ResourceSearchResponse>(
      API_ENDPOINTS.RESOURCES.SEARCH(businessId, '', 100)
    ).pipe(
      map(response => response.products || [])
    );
  }

  // Get single product by ID
  getProductById(businessId: string, productId: string): Observable<Product> {
    return this.http.get<Product>(
      API_ENDPOINTS.RESOURCES.PRODUCT_BY_ID(businessId, productId)
    );
  }

  createProduct(dto: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(
      API_ENDPOINTS.RESOURCES.CREATE_PRODUCT,
      dto
    );
  }

  updateProduct(productId: string, businessId: string, dto: UpdateProductDto): Observable<Product> {
    return this.http.put<Product>(
      API_ENDPOINTS.RESOURCES.UPDATE_PRODUCT(productId, businessId),
      dto
    );
  }

  deleteProduct(productId: string, businessId: string): Observable<void> {
    return this.http.delete<void>(
      API_ENDPOINTS.RESOURCES.DELETE_PRODUCT(productId, businessId)
    );
  }

  // Get all services (uses search endpoint)
  getServices(businessId: string): Observable<Service[]> {
    return this.http.get<ResourceSearchResponse>(
      API_ENDPOINTS.RESOURCES.SEARCH(businessId, '', 100)
    ).pipe(
      map(response => response.services || [])
    );
  }

  // Get single service by ID
  getServiceById(businessId: string, serviceId: string): Observable<Service> {
    return this.http.get<Service>(
      API_ENDPOINTS.RESOURCES.SERVICE_BY_ID(businessId, serviceId)
    );
  }

  createService(dto: CreateServiceDto): Observable<Service> {
    return this.http.post<Service>(
      API_ENDPOINTS.RESOURCES.CREATE_SERVICE,
      dto
    );
  }

  updateService(serviceId: string, businessId: string, dto: UpdateServiceDto): Observable<Service> {
    return this.http.put<Service>(
      API_ENDPOINTS.RESOURCES.UPDATE_SERVICE(serviceId, businessId),
      dto
    );
  }

  deleteService(serviceId: string, businessId: string): Observable<void> {
    return this.http.delete<void>(
      API_ENDPOINTS.RESOURCES.DELETE_SERVICE(serviceId, businessId)
    );
  }

  // Search - returns both products and services
  searchResources(businessId: string, query?: string, limit?: number, page?: number): Observable<ResourceSearchResponse> {
    return this.http.get<ResourceSearchResponse>(
      API_ENDPOINTS.RESOURCES.SEARCH(businessId, query, limit, page)
    );
  }

  // Get all resources (products + services) at once
  getAllResources(businessId: string): Observable<ResourceSearchResponse> {
    return this.http.get<ResourceSearchResponse>(
      API_ENDPOINTS.RESOURCES.SEARCH(businessId, '', 100)
    );
  }

  // Image upload
  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(
      API_ENDPOINTS.STORAGE.UPLOAD_IMAGE,
      formData
    );
  }
}
