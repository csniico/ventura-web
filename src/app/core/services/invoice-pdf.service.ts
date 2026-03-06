import { Injectable } from '@angular/core';
import { Invoice } from '../models/invoice.model';
import { Business } from '../../shared/models/business.model';

@Injectable({
  providedIn: 'root',
})
export class InvoicePdfService {
  generatePdf(invoice: Invoice, business: Business): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = this.buildInvoiceHtml(invoice, business);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  downloadPdf(invoice: Invoice, business: Business): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = this.buildInvoiceHtml(invoice, business);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  private buildInvoiceHtml(invoice: Invoice, business: Business): string {
    const orderItems = invoice.orders?.flatMap(o => o.items || []) || [];
    const statusColor = this.getStatusColor(invoice.status);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .brand h1 { font-size: 28px; font-weight: 700; color: #1e40af; }
    .brand p { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 20px; color: #374151; margin-bottom: 8px; }
    .invoice-meta .detail { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: white; background: ${statusColor}; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .party h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; margin-bottom: 8px; }
    .party p { font-size: 14px; color: #374151; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead th { background: #f9fafb; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    thead th:last-child, tbody td:last-child { text-align: right; }
    tbody td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 32px; }
    .totals-table { width: 300px; }
    .totals-table .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .totals-table .row.border-top { border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 4px; }
    .totals-table .row.grand-total { font-size: 18px; font-weight: 700; color: #1e40af; }
    .tax-detail { color: #9ca3af; font-size: 12px; }
    .notes { background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 32px; }
    .notes h3 { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
    .notes p { font-size: 13px; color: #6b7280; line-height: 1.6; }
    .footer { text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 12px; color: #9ca3af; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>${this.escapeHtml(business.name)}</h1>
      ${business.email ? `<p>${this.escapeHtml(business.email)}</p>` : ''}
      ${business.phone ? `<p>${this.escapeHtml(business.phone)}</p>` : ''}
      ${business.address ? `<p>${this.escapeHtml(business.address)}${business.city ? ', ' + this.escapeHtml(business.city) : ''}</p>` : ''}
      ${business.taxId ? `<p>Tax ID: ${this.escapeHtml(business.taxId)}</p>` : ''}
    </div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <div class="detail"><strong>${this.escapeHtml(invoice.invoiceNumber)}</strong></div>
      <div class="detail">Type: ${invoice.invoiceType}</div>
      ${invoice.issueDate ? `<div class="detail">Issue: ${new Date(invoice.issueDate).toLocaleDateString()}</div>` : ''}
      ${invoice.dueDate ? `<div class="detail">Due: ${new Date(invoice.dueDate).toLocaleDateString()}</div>` : ''}
      <div style="margin-top: 8px;"><span class="status">${invoice.status}</span></div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Bill To</h3>
      <p><strong>${this.escapeHtml(invoice.customer?.name || 'N/A')}</strong></p>
      ${invoice.customer?.email ? `<p>${this.escapeHtml(invoice.customer.email)}</p>` : ''}
      ${invoice.customer?.phone ? `<p>${this.escapeHtml(invoice.customer.phone)}</p>` : ''}
    </div>
    <div class="party" style="text-align: right;">
      <h3>Payment Info</h3>
      ${invoice.paymentMethod ? `<p>Method: ${invoice.paymentMethod.replace('_', ' ')}</p>` : ''}
      <p>Paid: GHS ${invoice.amountPaid.toFixed(2)}</p>
      <p>Balance: GHS ${(invoice.totalAmount - invoice.amountPaid).toFixed(2)}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item</th>
        <th>Type</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${orderItems.length > 0 ? orderItems.map((item: any, i: number) => `
        <tr>
          <td>${i + 1}</td>
          <td>${this.escapeHtml(item.name)}</td>
          <td>${item.itemType}</td>
          <td>${item.quantity}</td>
          <td>GHS ${Number(item.price).toFixed(2)}</td>
          <td>GHS ${Number(item.subTotal).toFixed(2)}</td>
        </tr>
      `).join('') : `
        <tr><td colspan="6" style="text-align: center; color: #9ca3af; padding: 24px;">No line items</td></tr>
      `}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-table">
      <div class="row">
        <span>Subtotal</span>
        <span>GHS ${Number(invoice.subtotal).toFixed(2)}</span>
      </div>
      <div class="row">
        <span>VAT <span class="tax-detail">(${(invoice.vatRate * 100).toFixed(1)}%)</span></span>
        <span>GHS ${Number(invoice.vatAmount).toFixed(2)}</span>
      </div>
      <div class="row">
        <span>NHIL <span class="tax-detail">(${(invoice.nhilRate * 100).toFixed(1)}%)</span></span>
        <span>GHS ${Number(invoice.nhilAmount).toFixed(2)}</span>
      </div>
      <div class="row">
        <span>GETFund <span class="tax-detail">(${(invoice.getfundRate * 100).toFixed(1)}%)</span></span>
        <span>GHS ${Number(invoice.getfundAmount).toFixed(2)}</span>
      </div>
      <div class="row border-top grand-total">
        <span>Total</span>
        <span>GHS ${Number(invoice.totalAmount).toFixed(2)}</span>
      </div>
    </div>
  </div>

  ${invoice.notes ? `
  <div class="notes">
    <h3>Notes</h3>
    <p>${this.escapeHtml(invoice.notes)}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>Generated by Ventura Business Intelligence</p>
    <p>Thank you for your business!</p>
  </div>
</body>
</html>`;
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      DRAFT: '#6b7280',
      SENT: '#2563eb',
      PAID: '#16a34a',
      PARTIALLY_PAID: '#d97706',
      OVERDUE: '#dc2626',
      CANCELLED: '#991b1b',
    };
    return colors[status] || '#6b7280';
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
