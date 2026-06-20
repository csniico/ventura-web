import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, switchMap, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../shared/api.constants';

interface PresignResponse {
  uploadUrl: string;
  url: string;
  key: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private http = inject(HttpClient);

  /**
   * Two-step upload (mirrors the mobile FileRepository): presign with the
   * backend, then PUT the bytes straight to storage. Returns the public URL.
   */
  uploadImage(file: File): Promise<{ imageUrl: string }> {
    return firstValueFrom(
      this.http
        .post<PresignResponse>(API_ENDPOINTS.FILES.PRESIGN, {
          filename: file.name,
          contentType: file.type,
          folder: 'logos',
        })
        .pipe(
          switchMap((presign) =>
            this.http
              .put(presign.uploadUrl, file, { headers: { 'Content-Type': file.type } })
              .pipe(map(() => ({ imageUrl: presign.url }))),
          ),
        ),
    );
  }
}
