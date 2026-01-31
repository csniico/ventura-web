import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, forkJoin, catchError, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { BusinessService } from '../../../core/services/business.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { CustomerService } from '../../../core/services/customer.service';
import { CalendarStateService } from '../services/calendar-state.service';
import { Appointment } from '../../../shared/models/appointment.model';
import { Customer } from '../../../shared/models/customer.model';
import { StatCardComponent } from '../components/stat-card/stat-card.component';
import { TodayScheduleComponent } from '../components/today-schedule/today-schedule.component';
import { RecentCustomersComponent } from '../components/recent-customers/recent-customers.component';
import { QuickActionsComponent } from '../components/quick-actions/quick-actions.component';
import { AppointmentModalComponent } from '../components/appointment-modal/appointment-modal.component';
import { DeleteConfirmationModalComponent } from '../components/delete-confirmation-modal/delete-confirmation-modal.component';

interface DashboardStats {
  todayAppointments: number;
  totalCustomers: number;
  upcomingAppointments: number;
  totalResources: number;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    StatCardComponent,
    TodayScheduleComponent,
    RecentCustomersComponent,
    QuickActionsComponent,
    AppointmentModalComponent,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly customerService = inject(CustomerService);
  private readonly calendarState = inject(CalendarStateService);
  private readonly destroy$ = new Subject<void>();

  // Loading states
  protected isLoading = signal(true);
  protected appointmentsLoading = signal(true);
  protected customersLoading = signal(true);

  // Data
  protected stats = signal<DashboardStats>({
    todayAppointments: 0,
    totalCustomers: 0,
    upcomingAppointments: 0,
    totalResources: 0
  });

  protected todayAppointments = signal<Appointment[]>([]);
  protected recentCustomers = signal<Customer[]>([]);

  // Computed
  protected business = computed(() => this.businessService.business());
  protected user = computed(() => this.authService.user());

  protected greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  protected currentDate = computed(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    const business = this.businessService.business();
    const businessId = business?.id || this.authService.user()?.businessId;

    if (!businessId) {
      this.isLoading.set(false);
      return;
    }

    // Load all data in parallel
    forkJoin({
      todayAppts: this.appointmentService.getTodayAppointments(businessId).pipe(
        catchError(() => of([]))
      ),
      upcomingAppts: this.appointmentService.getUpcomingAppointments(businessId).pipe(
        catchError(() => of([]))
      ),
      customers: this.customerService.getBusinessCustomers(businessId).pipe(
        catchError(() => of({ customers: [], total: 0 }))
      ),
      recentCustomers: this.customerService.getRecentCustomers(businessId, 5).pipe(
        catchError(() => of([]))
      )
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Update stats
          this.stats.set({
            todayAppointments: data.todayAppts.length,
            totalCustomers: data.customers.customers.length,
            upcomingAppointments: data.upcomingAppts.length,
            totalResources: 0 // TODO: Add resources count when API is ready
          });

          // Update lists
          this.todayAppointments.set(data.todayAppts);
          this.recentCustomers.set(data.recentCustomers);

          // Clear loading states
          this.isLoading.set(false);
          this.appointmentsLoading.set(false);
          this.customersLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.appointmentsLoading.set(false);
          this.customersLoading.set(false);
        }
      });
  }

  protected onQuickAction(action: string): void {
    if (action === 'appointment') {
      this.calendarState.openCreateModal();
    }
    // Other actions can be handled here
  }

  protected onAppointmentClick(appointment: Appointment): void {
    this.calendarState.openEditModal(appointment);
  }
}
