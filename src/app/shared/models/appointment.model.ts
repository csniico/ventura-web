export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  businessId: string;
  userId: string;
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
  userId: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  recurringUntil?: string;
}