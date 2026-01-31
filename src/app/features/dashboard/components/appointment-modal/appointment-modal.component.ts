import { Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CalendarStateService } from '../../services/calendar-state.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../../../core/services/business.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { Appointment, CreateAppointmentDto } from '../../../../shared/models/appointment.model';

@Component({
  selector: 'app-appointment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-modal.component.html'
})
export class AppointmentModalComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly calendarState = inject(CalendarStateService);
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly destroy$ = new Subject<void>();

  protected readonly isOpen = this.calendarState.isModalOpen;
  protected readonly modalMode = this.calendarState.modalMode;
  protected readonly selectedAppointment = this.calendarState.selectedAppointment;
  protected readonly prefilledDate = this.calendarState.prefilledDate;
  protected readonly customers = this.calendarState.customers;

  protected isLoading = signal(false);
  protected errorMessage = signal('');

  protected readonly recurringFrequencies = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'YEARLY', label: 'Yearly' }
  ];

  protected readonly appointmentForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    customerId: [''],
    startDate: ['', [Validators.required]],
    startTime: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    notes: ['', [Validators.maxLength(1000)]],
    isRecurring: [false],
    recurringFrequency: [''],
    recurringUntil: ['']
  });

  // Form control getters
  get title() { return this.appointmentForm.get('title'); }
  get description() { return this.appointmentForm.get('description'); }
  get customerId() { return this.appointmentForm.get('customerId'); }
  get startDate() { return this.appointmentForm.get('startDate'); }
  get startTime() { return this.appointmentForm.get('startTime'); }
  get endDate() { return this.appointmentForm.get('endDate'); }
  get endTime() { return this.appointmentForm.get('endTime'); }
  get notes() { return this.appointmentForm.get('notes'); }
  get isRecurring() { return this.appointmentForm.get('isRecurring'); }
  get recurringFrequency() { return this.appointmentForm.get('recurringFrequency'); }
  get recurringUntil() { return this.appointmentForm.get('recurringUntil'); }

  constructor() {
    // Watch for modal state changes and populate form
    effect(() => {
      const appointment = this.selectedAppointment();
      const prefilled = this.prefilledDate();
      const isOpen = this.isOpen();

      if (isOpen) {
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

  ngOnInit(): void {
    // Watch isRecurring to toggle validators
    this.isRecurring?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isRecurring => {
        this.toggleRecurringValidators(isRecurring);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private populateForm(appointment: Appointment): void {
    const startDate = new Date(appointment.startTime);
    const endDate = new Date(appointment.endTime);

    this.appointmentForm.patchValue({
      title: appointment.title,
      description: appointment.description || '',
      customerId: appointment.customerId || '',
      startDate: this.formatDateForInput(startDate),
      startTime: this.formatTimeForInput(startDate),
      endDate: this.formatDateForInput(endDate),
      endTime: this.formatTimeForInput(endDate),
      notes: appointment.notes || '',
      isRecurring: appointment.isRecurring,
      recurringFrequency: appointment.recurringFrequency || '',
      recurringUntil: appointment.recurringUntil ? this.formatDateForInput(new Date(appointment.recurringUntil)) : ''
    });

    this.toggleRecurringValidators(appointment.isRecurring);
  }

  private prefillDate(date: Date): void {
    this.resetForm();
    const dateStr = this.formatDateForInput(date);

    // Default to 9 AM - 10 AM
    this.appointmentForm.patchValue({
      startDate: dateStr,
      startTime: '09:00',
      endDate: dateStr,
      endTime: '10:00'
    });
  }

  private resetForm(): void {
    this.appointmentForm.reset({
      title: '',
      description: '',
      customerId: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      notes: '',
      isRecurring: false,
      recurringFrequency: '',
      recurringUntil: ''
    });
    this.errorMessage.set('');
  }

  private toggleRecurringValidators(isRecurring: boolean): void {
    if (isRecurring) {
      this.recurringFrequency?.setValidators([Validators.required]);
      this.recurringUntil?.setValidators([Validators.required]);
    } else {
      this.recurringFrequency?.clearValidators();
      this.recurringUntil?.clearValidators();
    }
    this.recurringFrequency?.updateValueAndValidity();
    this.recurringUntil?.updateValueAndValidity();
  }

  protected isDateRangeValid(): boolean {
    const startDate = this.startDate?.value;
    const startTime = this.startTime?.value;
    const endDate = this.endDate?.value;
    const endTime = this.endTime?.value;

    if (!startDate || !startTime || !endDate || !endTime) {
      return true; // Don't show error until all fields filled
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    return end > start;
  }

  protected onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    if (!this.isDateRangeValid()) {
      this.errorMessage.set('End date/time must be after start date/time');
      return;
    }

    const formValue = this.appointmentForm.value;
    const user = this.authService.getCurrentUser();
    const business = this.businessService.business();

    if (!user || !business) {
      this.errorMessage.set('User or business not found');
      return;
    }

    const startDateTime = new Date(`${formValue.startDate}T${formValue.startTime}`);
    const endDateTime = new Date(`${formValue.endDate}T${formValue.endTime}`);

    const dto: CreateAppointmentDto = {
      title: formValue.title,
      description: formValue.description || undefined,
      startTime: startDateTime,
      endTime: endDateTime,
      notes: formValue.notes || undefined,
      businessId: business.id,
      customerId: formValue.customerId || undefined,
      isRecurring: formValue.isRecurring,
      recurringFrequency: formValue.isRecurring ? formValue.recurringFrequency : undefined,
      recurringUntil: formValue.isRecurring ? formValue.recurringUntil : undefined
    };

    this.isLoading.set(true);
    this.errorMessage.set('');

    if (this.modalMode() === 'edit' && this.selectedAppointment()) {
      this.updateAppointment(this.selectedAppointment()!.id, dto);
    } else {
      this.createAppointment(dto);
    }
  }

  private createAppointment(dto: CreateAppointmentDto): void {
    this.appointmentService.createAppointment(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointment) => {
          this.isLoading.set(false);
          this.calendarState.addAppointment(appointment);
          this.calendarState.closeModal();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(this.extractErrorMessage(error));
        }
      });
  }

  private updateAppointment(id: string, dto: CreateAppointmentDto): void {
    this.appointmentService.updateAppointment(id, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointment) => {
          this.isLoading.set(false);
          this.calendarState.updateAppointment(appointment);
          this.calendarState.closeModal();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(this.extractErrorMessage(error));
        }
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
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.appointmentForm.controls).forEach(key => {
      this.appointmentForm.get(key)?.markAsTouched();
    });
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatTimeForInput(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.message && Array.isArray(error.error.message)) {
      return error.error.message[0];
    } else if (error?.error?.message) {
      return error.error.message;
    } else if (error?.message) {
      return error.message;
    }
    return 'An error occurred. Please try again.';
  }
}
