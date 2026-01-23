import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CalendarStateService } from '../../services/calendar-state.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../../../core/services/business.service';

@Component({
  selector: 'app-delete-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirmation-modal.component.html'
})
export class DeleteConfirmationModalComponent {
  private readonly calendarState = inject(CalendarStateService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly destroy$ = new Subject<void>();

  protected readonly isOpen = this.calendarState.isDeleteModalOpen;
  protected readonly appointment = this.calendarState.appointmentToDelete;

  protected isDeleting = signal(false);
  protected errorMessage = signal('');

  protected onConfirm(): void {
    const apt = this.appointment();
    if (!apt) return;

    const user = this.authService.getCurrentUser();
    const business = this.businessService.business();

    if (!user || !business) {
      this.errorMessage.set('User or business not found');
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set('');

    this.appointmentService.deleteAppointment(apt.id, user.id, business.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.calendarState.removeAppointment(apt.id);
          this.calendarState.closeDeleteModal();
        },
        error: (error) => {
          this.isDeleting.set(false);
          this.errorMessage.set(this.extractErrorMessage(error));
        }
      });
  }

  protected onCancel(): void {
    this.calendarState.closeDeleteModal();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.isDeleting()) {
      this.onCancel();
    }
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.message && Array.isArray(error.error.message)) {
      return error.error.message[0];
    } else if (error?.error?.message) {
      return error.error.message;
    } else if (error?.message) {
      return error.message;
    }
    return 'Failed to delete appointment. Please try again.';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
