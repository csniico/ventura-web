import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '../../../shared/api.constants';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private http = inject(HttpClient);

  uploadImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return firstValueFrom(
      this.http.post<{ imageUrl: string }>(API_ENDPOINTS.STORAGE.UPLOAD_IMAGE, formData)
    );
  }
}