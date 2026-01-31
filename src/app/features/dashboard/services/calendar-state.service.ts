import { Injectable, signal, computed } from '@angular/core';
import { Appointment } from '../../../shared/models/appointment.model';
import { Customer } from '../../../shared/models/customer.model';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

export type ViewMode = 'month' | 'week' | 'day';
export type ModalMode = 'create' | 'edit';

@Injectable({
  providedIn: 'root'
})
export class CalendarStateService {
  // View state
  readonly currentDate = signal<Date>(new Date());
  readonly viewMode = signal<ViewMode>('month');

  // Data state
  readonly appointments = signal<Appointment[]>([]);
  readonly customers = signal<Customer[]>([]);
  readonly isLoading = signal<boolean>(false);

  // Modal state
  readonly isModalOpen = signal<boolean>(false);
  readonly selectedAppointment = signal<Appointment | null>(null);
  readonly modalMode = signal<ModalMode>('create');
  readonly prefilledDate = signal<Date | null>(null);

  // Delete confirmation state
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly appointmentToDelete = signal<Appointment | null>(null);

  // Computed values
  readonly currentMonth = computed(() => this.currentDate().getMonth());
  readonly currentYear = computed(() => this.currentDate().getFullYear());

  readonly monthDays = computed(() => this.generateMonthDays());

  readonly appointmentsMap = computed(() => this.groupAppointmentsByDate());

  readonly monthYearLabel = computed(() => {
    return this.currentDate().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  });

  // Navigation methods
  navigateMonth(direction: 'prev' | 'next'): void {
    const current = this.currentDate();
    const newDate = new Date(current);

    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }

    this.currentDate.set(newDate);
  }

  navigateWeek(direction: 'prev' | 'next'): void {
    const current = this.currentDate();
    const newDate = new Date(current);

    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }

    this.currentDate.set(newDate);
  }

  navigateDay(direction: 'prev' | 'next'): void {
    const current = this.currentDate();
    const newDate = new Date(current);

    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }

    this.currentDate.set(newDate);
  }

  navigate(direction: 'prev' | 'next'): void {
    const mode = this.viewMode();
    switch (mode) {
      case 'month':
        this.navigateMonth(direction);
        break;
      case 'week':
        this.navigateWeek(direction);
        break;
      case 'day':
        this.navigateDay(direction);
        break;
    }
  }

  navigateToToday(): void {
    this.currentDate.set(new Date());
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  setDate(date: Date): void {
    this.currentDate.set(date);
  }

  // Modal control methods
  openCreateModal(date?: Date): void {
    this.selectedAppointment.set(null);
    this.prefilledDate.set(date || null);
    this.modalMode.set('create');
    this.isModalOpen.set(true);
  }

  openEditModal(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.prefilledDate.set(null);
    this.modalMode.set('edit');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedAppointment.set(null);
    this.prefilledDate.set(null);
  }

  // Delete modal control
  openDeleteModal(appointment: Appointment): void {
    this.appointmentToDelete.set(appointment);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.appointmentToDelete.set(null);
  }

  // Data methods
  setAppointments(appointments: Appointment[]): void {
    this.appointments.set(appointments);
    this.enrichAllAppointmentsWithCustomers();
  }

  setCustomers(customers: Customer[]): void {
    this.customers.set(customers);
    this.enrichAllAppointmentsWithCustomers();
  }

  addAppointment(appointment: Appointment): void {
    const enriched = this.enrichAppointmentWithCustomer(appointment);
    this.appointments.update(current => [...current, enriched]);
  }

  updateAppointment(updatedAppointment: Appointment): void {
    const enriched = this.enrichAppointmentWithCustomer(updatedAppointment);
    this.appointments.update(current =>
      current.map(apt => apt.id === enriched.id ? enriched : apt)
    );
  }

  removeAppointment(appointmentId: string): void {
    this.appointments.update(current =>
      current.filter(apt => apt.id !== appointmentId)
    );
  }

  // Customer enrichment helpers
  private enrichAppointmentWithCustomer(appointment: Appointment): Appointment {
    if (appointment.customer?.name || !appointment.customerId) {
      return appointment;
    }
    const customer = this.customers().find(c => c.id === appointment.customerId);
    return customer ? { ...appointment, customer } : appointment;
  }

  private enrichAllAppointmentsWithCustomers(): void {
    const customers = this.customers();
    if (customers.length === 0) return;

    this.appointments.update(appointments =>
      appointments.map(apt => {
        if (apt.customer?.name || !apt.customerId) {
          return apt;
        }
        const customer = customers.find(c => c.id === apt.customerId);
        return customer ? { ...apt, customer } : apt;
      })
    );
  }

  // Helper methods
  private generateMonthDays(): CalendarDay[] {
    const year = this.currentYear();
    const month = this.currentMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDay = firstDayOfMonth.getDay(); // 0-6 (Sun-Sat)
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month padding
    const prevMonth = new Date(year, month, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        appointments: this.getAppointmentsForDate(date)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      days.push({
        date,
        isCurrentMonth: true,
        isToday: dateOnly.getTime() === today.getTime(),
        appointments: this.getAppointmentsForDate(date)
      });
    }

    // Next month padding (to fill 6 rows = 42 cells)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        appointments: this.getAppointmentsForDate(date)
      });
    }

    return days;
  }

  private getAppointmentsForDate(date: Date): Appointment[] {
    const dateKey = this.formatDateKey(date);
    return this.appointmentsMap().get(dateKey) || [];
  }

  private groupAppointmentsByDate(): Map<string, Appointment[]> {
    const map = new Map<string, Appointment[]>();

    for (const apt of this.appointments()) {
      if (apt.isRecurring && apt.recurringFrequency && apt.recurringUntil) {
        // Expand recurring appointments
        const occurrences = this.expandRecurringAppointment(apt);
        for (const occurrence of occurrences) {
          const dateKey = this.formatDateKey(occurrence.date);
          if (!map.has(dateKey)) {
            map.set(dateKey, []);
          }
          map.get(dateKey)!.push(occurrence.appointment);
        }
      } else {
        // Non-recurring appointment
        const dateKey = this.formatDateKey(new Date(apt.startTime));
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(apt);
      }
    }

    // Sort appointments within each day by start time
    for (const [, apts] of map) {
      apts.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }

    return map;
  }

  private expandRecurringAppointment(apt: Appointment): { date: Date; appointment: Appointment }[] {
    const occurrences: { date: Date; appointment: Appointment }[] = [];
    const startDate = new Date(apt.startTime);
    const endDate = new Date(apt.recurringUntil!);
    endDate.setHours(23, 59, 59, 999); // Include the end date

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Create a virtual appointment for this occurrence
      const occurrenceStart = new Date(currentDate);
      const occurrenceEnd = new Date(currentDate);

      // Preserve the original time
      const originalStart = new Date(apt.startTime);
      const originalEnd = new Date(apt.endTime);

      occurrenceStart.setHours(originalStart.getHours(), originalStart.getMinutes(), originalStart.getSeconds());
      occurrenceEnd.setHours(originalEnd.getHours(), originalEnd.getMinutes(), originalEnd.getSeconds());

      // Create a copy of the appointment with adjusted times for display
      const occurrenceApt: Appointment = {
        ...apt,
        // Keep original startTime/endTime for editing purposes
        // The display will use the occurrence date
      };

      occurrences.push({
        date: new Date(currentDate),
        appointment: occurrenceApt
      });

      // Move to next occurrence based on frequency
      switch (apt.recurringFrequency?.toUpperCase()) {
        case 'DAILY':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'WEEKLY':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'YEARLY':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          // Unknown frequency, stop to prevent infinite loop
          return occurrences;
      }
    }

    return occurrences;
  }

  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
