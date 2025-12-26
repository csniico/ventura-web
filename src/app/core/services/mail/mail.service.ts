import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { ContactForm } from '../../../shared/models/contact-form.model';

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/mailer`;

  sendMail(data: ContactForm): void {
    if (!data.email || !data.message) {
      console.error('Email and message are required to send mail.');
      return;
    }
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
    this.http.post(`${this.apiUrl}/send-email`, body).subscribe({
      next: () => console.log('Mail sent successfully'),
      error: (err) => console.error('Failed to send mail', err),
    });
  }
}
