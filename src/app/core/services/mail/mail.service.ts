import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactForm, ApiResponse, API_ENDPOINTS } from '../../../shared';

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private http = inject(HttpClient);

  sendMail(data: ContactForm): Observable<ApiResponse> {
    const body = {
      recipients: ['cncs.chris@gmail.com'],
      cc: ['cncs2101@gmail.com'],
      subject: 'Ventura: New Contact Form Submission',
      htmlBody: `
        <p>You have a new contact form submission:</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `,
    };

    return this.http.post<ApiResponse>(API_ENDPOINTS.MAIL.SEND, body);
  }
}
