import { Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CalendarStateService } from '../../services/calendar-state.service';
import { BusinessService } from '../../../../core/services/business.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Appointment, CreateAppointmentDto, Invitee } from '../../../../shared/models/appointment.model';

@Component({
  selector: 'app-appointment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-modal.component.html',
})
export class AppointmentModalComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly calendarState = inject(CalendarStateService);
  private readonly businessService = inject(BusinessService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  protected readonly isOpen = this.calendarState.isModalOpen;
  protected readonly modalMode = this.calendarState.modalMode;
  protected readonly selectedAppointment = this.calendarState.selectedAppointment;
  protected readonly prefilledDate = this.calendarState.prefilledDate;
  protected readonly customers = this.calendarState.customers;

  protected isLoading = signal(false);
  protected errorMessage = signal('');
  protected invitees = signal<Invitee[]>([]);

  // Recurrence frequencies match the backend (daily | weekly | monthly).
  protected readonly recurringFrequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  // Main form mirrors the mobile flow: a single date + start/end times.
  protected readonly appointmentForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    date: ['', [Validators.required]],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    location: [''],
    notes: ['', [Validators.maxLength(1000)]],
    isRecurring: [false],
    recurringFrequency: ['weekly'],
    recurringInterval: [1, [Validators.min(1)]],
    recurringUntil: [''],
  });

  // Separate sub-form for adding an invitee (customer pick or free name/email).
  protected readonly inviteeForm: FormGroup = this.fb.group({
    customerId: [''],
    name: [''],
    email: [''],
  });

  get title() { return this.appointmentForm.get('title'); }
  get date() { return this.appointmentForm.get('date'); }
  get startTime() { return this.appointmentForm.get('startTime'); }
  get endTime() { return this.appointmentForm.get('endTime'); }
  get isRecurring() { return this.appointmentForm.get('isRecurring'); }
  get recurringFrequency() { return this.appointmentForm.get('recurringFrequency'); }

  constructor() {
    effect(() => {
      const appointment = this.selectedAppointment();
      const prefilled = this.prefilledDate();
      if (this.isOpen()) {
        if (appointment && this.modalMode() === 'edit') {
          this.populateForm(appointment);
        } else if (prefilled) {
          this.prefillDate(prefilled);
        } else {
          this.resetForm();
        }
      }
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---- Invitees -----------------------------------------------------------

  protected onInviteeCustomerChange(): void {
    const id = this.inviteeForm.value.customerId;
    if (!id) return;
    const customer = this.customers().find((c) => c.id === id);
    if (customer) {
      this.inviteeForm.patchValue({ name: customer.name, email: customer.email || '' });
    }
  }

  protected addInvitee(): void {
    const { customerId, name, email } = this.inviteeForm.value;
    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim();
    if (!trimmedName && !customerId) return;

    const invitee: Invitee = {
      name: trimmedName || 'Invitee',
      email: trimmedEmail || undefined,
      customerId: customerId || undefined,
    };
    const exists = this.invitees().some(
      (i) =>
        (invitee.customerId && i.customerId === invitee.customerId) ||
        (invitee.email && i.email === invitee.email),
    );
    if (!exists) this.invitees.update((list) => [...list, invitee]);
    this.inviteeForm.reset({ customerId: '', name: '', email: '' });
  }

  protected removeInvitee(index: number): void {
    this.invitees.update((list) => list.filter((_, i) => i !== index));
  }

  // ---- Populate / reset ---------------------------------------------------

  private populateForm(appointment: Appointment): void {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    this.appointmentForm.patchValue({
      title: appointment.title,
      date: this.dateInput(start),
      startTime: this.timeInput(start),
      endTime: this.timeInput(end),
      location: appointment.location || '',
      notes: appointment.notes || '',
      isRecurring: appointment.isRecurring,
      recurringFrequency: (appointment.recurringFrequency || 'weekly').toLowerCase(),
      recurringInterval: appointment.recurringInterval || 1,
      recurringUntil: appointment.recurringUntil ? this.dateInput(new Date(appointment.recurringUntil)) : '',
    });
    this.invitees.set(appointment.invitees ? [...appointment.invitees] : []);
  }

  private prefillDate(date: Date): void {
    this.resetForm();
    this.appointmentForm.patchValue({
      date: this.dateInput(date),
      startTime: '09:00',
      endTime: '10:00',
    });
  }

  private resetForm(): void {
    this.appointmentForm.reset({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      notes: '',
      isRecurring: false,
      recurringFrequency: 'weekly',
      recurringInterval: 1,
      recurringUntil: '',
    });
    this.inviteeForm.reset({ customerId: '', name: '', email: '' });
    this.invitees.set([]);
    this.errorMessage.set('');
  }

  // ---- Submit -------------------------------------------------------------

  protected onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }
    const v = this.appointmentForm.value;
    const start = new Date(`${v.date}T${v.startTime}`);
    let end = new Date(`${v.date}T${v.endTime}`);
    if (!(end > start)) {
      // Keep end after start (mirror mobile: default to +1h).
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }

    const dto: CreateAppointmentDto = {
      title: v.title,
      startTime: start,
      endTime: end,
      location: v.location || undefined,
      notes: v.notes || undefined,
      invitees: this.invitees().length ? this.invitees() : undefined,
      isRecurring: v.isRecurring,
      recurringFrequency: v.isRecurring ? v.recurringFrequency : undefined,
      recurringInterval: v.isRecurring ? v.recurringInterval || 1 : undefined,
      recurringUntil: v.isRecurring && v.recurringUntil ? v.recurringUntil : undefined,
    };

    this.isLoading.set(true);
    this.errorMessage.set('');

    const editing = this.modalMode() === 'edit' && this.selectedAppointment();
    const request$ = editing
      ? this.appointmentService.updateAppointment(this.selectedAppointment()!.id, dto)
      : this.appointmentService.createAppointment(dto);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (appointment) => {
        this.isLoading.set(false);
        if (editing) {
          this.calendarState.updateAppointment(appointment);
        } else {
          this.calendarState.addAppointment(appointment);
          this.notificationService.showSuccess(`Appointment "${appointment.title}" scheduled`);
        }
        this.calendarState.closeModal();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  protected onDelete(): void {
    const appointment = this.selectedAppointment();
    if (appointment) {
      this.calendarState.closeModal();
      this.calendarState.openDeleteModal(appointment);
    }
  }

  protected onClose(): void {
    this.calendarState.closeModal();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose();
  }

  private dateInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private timeInput(date: Date): string {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.message) {
      return Array.isArray(error.error.message) ? error.error.message[0] : error.error.message;
    }
    return error?.message || 'An error occurred. Please try again.';
  }
}
