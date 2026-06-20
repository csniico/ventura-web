import { Customer } from './customer.model';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
}

/** An appointment invitee — either a linked customer or a free name/email. */
export interface Invitee {
  name: string;
  email?: string;
  customerId?: string;
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  notes?: string;
  businessId: string;
  userId: string;
  customerId?: string;
  customer?: Customer;
  invitees?: Invitee[];
  status: AppointmentStatus;
  isRecurring: boolean;
  recurringFrequency?: string;
  recurringInterval?: number;
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
  location?: string;
  notes?: string;
  businessId?: string;
  customerId?: string;
  invitees?: Invitee[];
  isRecurring: boolean;
  recurringFrequency?: string;
  recurringInterval?: number;
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
