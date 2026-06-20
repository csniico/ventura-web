import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { API_ENDPOINTS, PaginatedResponse, withId, withIds } from '../../shared';
import {
  Product,
  Service,
  CreateProductDto,
  CreateServiceDto,
  UpdateProductDto,
  UpdateServiceDto,
  ResourceSearchResponse,
} from '../models/resource.model';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private readonly http = inject(HttpClient);

  // ---- Products -----------------------------------------------------------

  getProducts(businessId: string): Observable<Product[]> {
    return this.listByType('product', 100).pipe(map((r) => (r.products ?? []) as Product[]));
  }

  getProductById(businessId: string, productId: string): Observable<Product> {
    return this.http.get<any>(API_ENDPOINTS.RESOURCES.BY_ID(productId)).pipe(map((p) => withId(p) as Product));
  }

  createProduct(dto: CreateProductDto): Observable<Product> {
    return this.http
      .post<any>(API_ENDPOINTS.RESOURCES.BASE, { type: 'product', ...this.strip(dto) })
      .pipe(map((p) => withId(p) as Product));
  }

  updateProduct(productId: string, businessId: string, dto: UpdateProductDto): Observable<Product> {
    return this.http
      .patch<any>(API_ENDPOINTS.RESOURCES.BY_ID(productId), this.strip(dto))
      .pipe(map((p) => withId(p) as Product));
  }

  deleteProduct(productId: string, businessId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.RESOURCES.BY_ID(productId));
  }

  // ---- Services -----------------------------------------------------------

  getServices(businessId: string): Observable<Service[]> {
    return this.listByType('service', 100).pipe(map((r) => (r.services ?? []) as Service[]));
  }

  getServiceById(businessId: string, serviceId: string): Observable<Service> {
    return this.http.get<any>(API_ENDPOINTS.RESOURCES.BY_ID(serviceId)).pipe(map((s) => withId(s) as Service));
  }

  createService(dto: CreateServiceDto): Observable<Service> {
    return this.http
      .post<any>(API_ENDPOINTS.RESOURCES.BASE, { type: 'service', ...this.strip(dto) })
      .pipe(map((s) => withId(s) as Service));
  }

  updateService(serviceId: string, businessId: string, dto: UpdateServiceDto): Observable<Service> {
    return this.http
      .patch<any>(API_ENDPOINTS.RESOURCES.BY_ID(serviceId), this.strip(dto))
      .pipe(map((s) => withId(s) as Service));
  }

  deleteService(serviceId: string, businessId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.RESOURCES.BY_ID(serviceId));
  }

  // ---- Search / combined --------------------------------------------------

  searchResources(
    businessId: string,
    query?: string,
    limit?: number,
    page?: number,
  ): Observable<ResourceSearchResponse> {
    let params = new HttpParams();
    if (query) params = params.set('q', query);
    if (limit) params = params.set('limit', limit);
    if (page) params = params.set('page', page);
    return this.http.get<PaginatedResponse<any>>(API_ENDPOINTS.RESOURCES.BASE, { params }).pipe(
      map((res) => this.split(res.data)),
    );
  }

  getAllResources(businessId: string): Observable<ResourceSearchResponse> {
    return this.searchResources(businessId, '', 100, 1);
  }

  /**
   * Two-step upload: presign, then PUT the bytes straight to storage. Returns
   * the public URL the caller stores on the entity.
   */
  uploadImage(file: File): Observable<{ url: string }> {
    return this.http
      .post<{ uploadUrl: string; url: string; key: string }>(API_ENDPOINTS.FILES.PRESIGN, {
        filename: file.name,
        contentType: file.type,
        folder: 'resources',
      })
      .pipe(
        switchMap((presign) =>
          this.http
            .put(presign.uploadUrl, file, { headers: { 'Content-Type': file.type } })
            .pipe(map(() => ({ url: presign.url }))),
        ),
      );
  }

  private listByType(type: 'product' | 'service', limit: number): Observable<ResourceSearchResponse> {
    const params = new HttpParams().set('type', type).set('limit', limit);
    return this.http
      .get<PaginatedResponse<any>>(API_ENDPOINTS.RESOURCES.BASE, { params })
      .pipe(map((res) => this.split(res.data)));
  }

  private split(rows: any[]): ResourceSearchResponse {
    const all = withIds(rows ?? []);
    return {
      products: all.filter((r) => r['type'] === 'product') as unknown as Product[],
      services: all.filter((r) => r['type'] === 'service') as unknown as Service[],
    };
  }

  private strip<T extends Record<string, any>>(obj: T): Omit<T, 'businessId'> {
    const { businessId, ...rest } = obj as Record<string, any>;
    return rest as Omit<T, 'businessId'>;
  }
}
