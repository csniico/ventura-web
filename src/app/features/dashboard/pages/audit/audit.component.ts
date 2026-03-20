import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { AuditService } from '../../../../core/services/audit.service';
import { AuditStateService, AuditTab } from '../../services/audit-state.service';
import { BusinessService } from '../../../../core/services/business.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AuditLog, AuditAction, AuditEntityType } from '../../../../core/models/audit.model';
import { SearchInputComponent } from '../../../../shared/components/search-input.component';
import { AuditLogListComponent } from './audit-log-list.component';
import { AuditDetailModalComponent } from './audit-detail-modal.component';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    AuditLogListComponent,
    AuditDetailModalComponent,
  ],
  templateUrl: './audit.component.html',
})
export class AuditComponent implements OnInit, OnDestroy {
  protected readonly auditState = inject(AuditStateService);
  private readonly auditService = inject(AuditService);
  private readonly businessService = inject(BusinessService);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');
  protected readonly showFilters = signal(false);

  protected readonly entityTypes = Object.values(AuditEntityType);
  protected readonly actionTypes = Object.values(AuditAction);

  protected readonly tabs: { key: AuditTab; label: string }[] = [
    { key: 'all', label: 'All Activity' },
    { key: 'entity', label: 'By Entity' },
    { key: 'user', label: 'My Activity' },
    { key: 'action', label: 'By Action' },
  ];

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAuditLogs(): void {
    const user = this.authService.user();
    if (!user) return;

    this.auditState.setLogsLoading(true);
    this.auditService
      .getUserLogs(user.id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to load audit logs', 'error');
          return of([]);
        })
      )
      .subscribe((logs) => {
        this.auditState.setLogs(logs);
        this.auditState.setLogsLoading(false);
      });
  }

  protected getTabCount(tab: AuditTab): number {
    const counts = this.auditState.logCounts();
    switch (tab) {
      case 'all':
        return counts.all;
      case 'entity':
        return counts.all;
      case 'user':
        return counts.all;
      case 'action':
        return counts.all;
      default:
        return 0;
    }
  }

  protected onTabChange(tab: AuditTab): void {
    this.auditState.setActiveTab(tab);

    if (tab === 'user') {
      this.loadUserLogs();
    } else if (tab === 'action') {
      const action = this.auditState.filters().action;
      if (action) {
        this.loadActionLogs(action);
      }
    }
  }

  private loadUserLogs(): void {
    const user = this.authService.user();
    if (!user) return;

    this.auditState.setLogsLoading(true);
    this.auditService
      .getUserLogs(user.id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to load user logs', 'error');
          return of([]);
        })
      )
      .subscribe((logs) => {
        this.auditState.setLogs(logs);
        this.auditState.setLogsLoading(false);
      });
  }

  private loadActionLogs(action: AuditAction): void {
    this.auditState.setLogsLoading(true);
    this.auditService
      .getActionLogs(action)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.showToast('Failed to load action logs', 'error');
          return of([]);
        })
      )
      .subscribe((logs) => {
        this.auditState.setLogs(logs);
        this.auditState.setLogsLoading(false);
      });
  }

  protected onSearch(query: string): void {
    this.auditState.setSearchQuery(query);
  }

  protected onEntityTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.auditState.setEntityTypeFilter(value ? (value as AuditEntityType) : null);
  }

  protected onActionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const action = value ? (value as AuditAction) : null;
    this.auditState.setActionFilter(action);

    if (action && this.auditState.activeTab() === 'action') {
      this.loadActionLogs(action);
    }
  }

  protected onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'asc' | 'desc';
    this.auditState.setSortOrder(value);
  }

  protected onDateRangeChange(type: 'start' | 'end', event: Event): void {
    const value = (event.target as HTMLInputElement).value || null;
    const filters = this.auditState.filters();
    if (type === 'start') {
      this.auditState.setDateRange(value, filters.endDate);
    } else {
      this.auditState.setDateRange(filters.startDate, value);
    }
  }

  protected onPageChange(page: number): void {
    this.auditState.setCurrentPage(page);
  }

  protected onViewLog(log: AuditLog): void {
    this.auditState.openDetail(log);
  }

  protected toggleFilters(): void {
    this.showFilters.update((v) => !v);
  }

  protected clearFilters(): void {
    this.auditState.clearFilters();
  }

  protected formatEntity(entity: string): string {
    return entity.replace(/_/g, ' ');
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}
