import { Customer } from './customer.model';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  businessId: string;
  userId: string;
  customerId?: string;
  customer?: Customer;
  status: AppointmentStatus;
  isRecurring: boolean;
  recurringFrequency?: string;
  recurringUntil?: string;
  googleEventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentDto {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  businessId: string;
  customerId?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  recurringUntil?: string;
}

export interface UpdateAppointmentDto {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  customerId?: string | null;
  status?: AppointmentStatus;
  isRecurring?: boolean;
  recurringFrequency?: string;
  recurringUntil?: string;
}
