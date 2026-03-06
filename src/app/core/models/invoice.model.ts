import { Customer } from './customer.model';
import { Order } from './order.model';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  MOBILE_MONEY = 'MOBILE_MONEY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  CHEQUE = 'CHEQUE'
}

export enum InvoiceType {
  STANDARD = 'STANDARD',
  PROFORMA = 'PROFORMA',
  RECEIPT = 'RECIEPT'
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  businessId: string;
  customerId: string;
  invoiceType: InvoiceType;

  // Relationships
  customer?: Customer;
  orders?: Order[];

  // Financial Details - Ghana VAT Structure
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  nhilRate: number;
  nhilAmount: number;
  getfundRate: number;
  getfundAmount: number;
  totalTax: number;
  totalAmount: number;

  // Payment tracking
  amountPaid: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;

  // Dates
  issueDate?: string;
  dueDate?: string;

  // Notes
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceDto {
  businessId: string;
  customerId: string;
  orderIds: string[];
  dueDate: string;
  invoiceType?: InvoiceType;
  notes?: string;
}

export interface UpdateInvoicePaymentDto {
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
}

export interface UpdateInvoiceStatusDto {
  status: InvoiceStatus;
}

export interface GetInvoicesParams {
  businessId: string;
  status?: InvoiceStatus;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedInvoices {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
